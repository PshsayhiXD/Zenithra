import {
  ChannelType,
  MessageFlags,
  type ChatInputCommandInteraction,
  type GuildMember,
  type InteractionReplyOptions,
} from "discord.js";
import type { SlashCommandResult } from "@commands/types/slashCommand.js";

import { SLASH_COMMANDS } from "@configs/slashCommands.js";
import { getRemainingCooldown, setCooldown } from "@tables/cooldown/index.js";
import { upsertGuild } from "@tables/guild/index.js";
import { upsertUser } from "@tables/user/index.js";
import { msTo } from "@utilities/time.js";
import { createLogger } from "@utilities/logger.js";
import { createEmbed } from "@utilities/components/embedComponent.js";
import { slashCommands } from "@commands/_slashCommands.js";
import { code, type CodeNumber } from "@deps/code.js";
import { getDeps } from "@dependency/getDeps.js";
import { formatCommandPermission, hasCommandPermission } from "@commands/shared.js";

const logger = createLogger("SlashHandler");

const isErrorResult = (v: unknown): v is [CodeNumber, string] =>
  Array.isArray(v) && typeof v[0] === "number" && typeof v[1] === "string";

export const handleSlashCommand = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const cmd = slashCommands.find(v => v.name === interaction.commandName);
  if (!cmd) return;

  const inGuild = interaction.inGuild();
  if (!inGuild && "guildId" in cmd) return;

  if (inGuild) upsertGuild(interaction.guildId);
  upsertUser(interaction.user.id);

  const send = async (payload: InteractionReplyOptions): Promise<void> => {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const { flags: _flags, ...editPayload } = payload;
    await interaction.editReply(editPayload);
  };

  if (cmd.cooldown !== undefined && cmd.cooldown > 0) {
    const remaining = getRemainingCooldown(interaction.user.id, cmd.name);
    if (remaining > 0) {
      const seconds = msTo(remaining, "sec");

      await send({
        embeds: [
          createEmbed({
            title: "Cooldown",
            description: `Please wait **${String(seconds)}s** before using \`${cmd.name}\` again.`,
            color: "Red",
            options: { interaction, timestamp: new Date() },
          }),
        ],
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    setCooldown(interaction.user.id, cmd.name, cmd.cooldown * 1000);
  }

  const member = inGuild ? (interaction.member as GuildMember | null) : null;
  const isGroupDM = interaction.channel?.type === ChannelType.GroupDM;
  const groupPermission = "groupPermission" in cmd ? cmd.groupPermission : undefined;

  if (!hasCommandPermission(member, cmd.permission, groupPermission, isGroupDM)) {
    await send({
      embeds: [
        createEmbed({
          title: "Error",
          description: "You don't have permission to use this command.",
          fields: [
            { name: "Command", value: `\`${cmd.name}\``, inline: true },
            {
              name: "Required",
              value: formatCommandPermission(cmd.permission),
            },
          ],
          color: "Red",
          options: { interaction, timestamp: new Date() },
        }),
      ],
      flags: MessageFlags.Ephemeral,
    });

    return;
  }

  const raw = `/${interaction.commandName}`;
  const arguments_ = interaction.options.data.map(v => String(v.value ?? ""));
  const options = interaction.options;

  try {
    const deps = getDeps(cmd.dependencies);

    logger.info("Executing slash command", {
      command: cmd.name,
      userId: interaction.user.id,
      userTag: interaction.user.tag,
      guildId: interaction.guildId ?? null,
      guildName: interaction.guild?.name ?? "DM",
    });

    const result: SlashCommandResult = await cmd.execute({
      interaction,
      args: arguments_,
      name: interaction.commandName,
      raw,
      deps,
      cmd,
      options,
    });

    logger.info("Executed slash command", {
      command: cmd.name,
      result,
    });

    if (result === code.Success) return;

    if (result === code.Warning) {
      await send({
        embeds: [
          createEmbed({
            title: `Warning (${String(code.Warning)})`,
            description: "Command executed successfully but with nothing affected.",
            color: "Yellow",
            options: { interaction, timestamp: new Date() },
          }),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (isErrorResult(result)) {
      const [codeNumber, reason] = result;

      await send({
        embeds: [
          createEmbed({
            title: code[codeNumber],
            description: reason,
            color: "Red",
            options: { interaction, timestamp: new Date() },
          }),
        ],
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    logger.warn("Slash command returned unrecognised result", {
      command: cmd.name,
      result,
    });

  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));

    logger.error(error_, {
      command: cmd.name,
      userId: interaction.user.id,
      guildId: interaction.guildId ?? null,
    });

    await send({
      embeds: [
        createEmbed({
          title: `${SLASH_COMMANDS.ERROR_REACTION} Error`,
          description: error_.message,
          color: "Red",
          options: { interaction, timestamp: new Date() },
        }),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
};
