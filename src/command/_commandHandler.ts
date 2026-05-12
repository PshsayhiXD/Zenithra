import { COMMANDS } from "@config/commands.js";
import type { CommandResult } from "@/command/types/command.js";

import createEmbed from "@/utilities/components/embedComponent.js";
import { commands } from "@/command/_commands.js";
import { code, getDeps, type CodeNumber } from "@dependencies";
import { formatCommandPermission, hasCommandPermission } from "@command/shared.js";
import { createLogger } from "@utilities/logger.js";
import { getRemainingCooldown, setCooldown } from "@tables/cooldown/index.js";
import { getPrefix, upsertGuild } from "@tables/guild/index.js";
import { upsertUser } from "@tables/user/index.js";
import type { Message } from "discord.js";

const log = createLogger("Command");

export const handleCommand = async (message: Message): Promise<void> => {
  if (message.guild === null) return;
  if (commands.length === 0) {
    log.warn("No commands loaded");
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

  const prefix = getPrefix(message.guild.id);
  if (!message.content.startsWith(prefix)) return;

  upsertGuild(message.guild.id);
  upsertUser(message.author.id);
  const raw = message.content.slice(prefix.length).trim();
  if (raw.length === 0) return;
  const parts = raw.trim().split(/\s+/);
  const inputName = parts[0];
  if (inputName === undefined) return;
  const arguments_ = parts.slice(1);
  const name = inputName.toLowerCase();
  const cmd = commands.find(v => v.name === name || v.aliases.includes(name));
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
    log.info(`Executing ${cmd.name}`, {
      command: cmd.name,
      userId: message.author.id,
      userTag: message.author.tag,
      guildId: message.guild.id,
      guildName: message.guild.name,
    });

    const result: CommandResult = await cmd.execute({
      message,
      args: cmd.args.length > 0 ? arguments_ : [],
      name,
      raw,
      deps,
      cmd,
    });

    log.info(`Executed ${cmd.name}`, { command: cmd.name, result });

    if (result === code.Success) return;

    if (result === code.Warning) {
      await message.react(COMMANDS.WARNING_REACTION).catch((): undefined => undefined);
      await message.reply({
        embeds: [
          createEmbed({
            title: "Warning (0)",
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

    log.warn("Command returned unrecognised result", { command: cmd.name, result });
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.error(error_, { command: cmd.name });
    await message.react(COMMANDS.ERROR_REACTION).catch((): undefined => undefined);
  }
};
