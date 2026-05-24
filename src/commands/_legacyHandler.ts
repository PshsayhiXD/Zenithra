import { LEGACY_COMMANDS } from "@configs/legacyCommands.js";
import type { CommandResult } from "@commands/types/command.js";

import { createEmbed } from "@utilities/components/embedComponent.js";
import { legacyCommands } from "@commands/_legacyCommands.js";
import { code, getDeps, type CodeNumber } from "@dependencies";
import { formatCommandPermission, hasCommandPermission, parseArguments } from "@commands/shared.js";
import { createLogger } from "@utilities/logger.js";
import { getRemainingCooldown, setCooldown } from "@tables/cooldown/index.js";
import { getPrefix, upsertGuild } from "@tables/guild/index.js";
import { upsertUser } from "@tables/user/index.js";
import type { Message } from "discord.js";

const logger = createLogger("Command");

export const handleLegacyCommand = async (message: Message): Promise<void> => {
  const guild = message.guild;
  if (!guild) return;
  if (legacyCommands.length === 0) {
    logger.warn("No commands loaded");
    await message.reply({
      embeds: [
        createEmbed({
          title: "Error",
          description: "No commands loaded",
          color: "Red",
          footer: {
            text: message.author.username,
            iconURL: message.author.displayAvatarURL({ extension: "png", size: 1024 }),
          },
          options: { message, timestamp: new Date() },
        }),
      ],
    });
    return;
  }

  const prefix = getPrefix(guild.id);
  if (!message.content.startsWith(prefix)) return;

  upsertGuild(guild.id);
  upsertUser(message.author.id);
  const raw = message.content.slice(prefix.length).trim();
  if (raw.length === 0) return;
  const parts = raw.trim().split(/\s+/);
  const inputName = parts[0];
  if (inputName === undefined) return;
  const parsed = parseArguments(parts.slice(1));

  const arguments_ = parsed.positionals;
  const flags = parsed.flags;

  const name = inputName.toLowerCase();
  const cmd = legacyCommands.find(v => v.name === name || v.aliases.includes(name));
  if (cmd === undefined) return;

  if (cmd.cooldown && cmd.cooldown > 0) {
    const remaining = getRemainingCooldown(message.author.id, cmd.name);
    if (remaining > 0) {
      const seconds = (remaining / 1000).toFixed(1);
      await message.reply({
        embeds: [
          createEmbed({
            title: "Cooldown",
            description: `Please wait **${seconds}s** before using \`${cmd.name}\` again.`,
            color: "Red",
            options: { message, timestamp: new Date() },
            footer: {
              text: message.author.username,
              iconURL: message.author.displayAvatarURL({ extension: "png", size: 1024 }),
            },
          }),
        ],
      });
      return;
    }
    setCooldown(message.author.id, cmd.name, cmd.cooldown * 1000);
  }

  if (!hasCommandPermission(message.member, cmd.permission)) {
    await message.reply({
      embeds: [
        createEmbed({
          title: "Error",
          description: "You don't have permission to use this command.",
          fields: [
            { name: "Command", value: `\`${cmd.name}\``, inline: true },
            { name: "Required", value: formatCommandPermission(cmd.permission) },
          ],
          color: "Red",
          footer: {
            text: message.author.username,
            iconURL: message.author.displayAvatarURL({ extension: "png", size: 1024 }),
          },
          options: { message, timestamp: new Date() },
        }),
      ],
    });
    return;
  }

  if (cmd.args.length > 0) {
    const missingArguments = cmd.args.filter(
      (argument, index) => argument.required && arguments_[index] === undefined,
    );
    if (missingArguments.length > 0) {
      const usage = cmd.args
        .map(argument => (argument.required ? `<${argument.name}>` : `[${argument.name}]`))
        .join(" ");
      const type = cmd.args.map(argument => argument.type);
      await message.reply({
        embeds: [
          createEmbed({
            title: "Missing Arguments",
            description: `Usage: \`${prefix}${name} ${usage}\`\nType: \`${type.join(", ")}\``,
            fields: missingArguments.map(argument => ({
              name: argument.name,
              value: argument.description ?? "No description provided",
              inline: true,
            })),
            color: "Yellow",
            options: { message, timestamp: new Date() },
            footer: {
              text: message.author.username,
              iconURL: message.author.displayAvatarURL({ extension: "png", size: 1024 }),
            },
          }),
        ],
      });
      return;
    }
  }

  try {
    const deps = getDeps(cmd.dependencies);
    logger.info(`Executing ${cmd.name}`, {
      command: cmd.name,
      userId: message.author.id,
      userTag: message.author.tag,
      guildId: guild.id,
      guildName: guild.name,
    });

    const result: CommandResult = await cmd.execute({
      platform: "discord",
      isDiscord: true,
      isDrednot: false,
      userId: message.author.id,
      username: message.author.username,
      userAvatarUrl: message.author.displayAvatarURL(),
      guildId: guild.id,
      message,
      args: arguments_,
      flags,
      name,
      raw,
      deps,
      cmd,
    });

    logger.info(`Executed ${cmd.name}`, { command: cmd.name, result });

    if (result === code.Success) return;

    if (result === code.Warning) {
      await message.react(LEGACY_COMMANDS.WARNING_REACTION).catch((): undefined => undefined);
      await message.reply({
        embeds: [
          createEmbed({
            title: `Warning (${String(code.Warning)})`,
            description: "Command executed successfully but with nothing affected.",
            color: "Yellow",
            options: { message, timestamp: new Date() },
          }),
        ],
      });
      return;
    }

    const isErrorResult = (v: unknown): v is [CodeNumber, string] =>
      Array.isArray(v) && typeof v[0] === "number" && typeof v[1] === "string";

    if (isErrorResult(result)) {
      const [codeNumber, reason] = result;
      await message.reply({
        embeds: [
          createEmbed({
            title: code[codeNumber],
            description: reason,
            color: "Red",
            options: { message, timestamp: new Date() },
          }),
        ],
      });
      return;
    }

    logger.warn("Command returned unrecognized result", { command: cmd.name, result });
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    logger.error(error_, { command: cmd.name });
    await message.react(LEGACY_COMMANDS.ERROR_REACTION).catch((): undefined => undefined);
  }
};
