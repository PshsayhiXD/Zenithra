import {
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord.js";
import type { SlashCommand, SlashCommandResult } from "@command/types/slashCommand.js";

export default {
  shouldRegister: true,
  name: "missiontimer",
  id: 3,
  category: "drednot.io",
  description: "Shows the current and future mission timers.",
  args: [
    {
      name: "count",
      description: "Number of future missions to show (default: 3).",
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
    {
      name: "ephemeral",
      description: "Whether the response should be ephemeral.",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  permission: {},
  dependencies: ["eventTracker", "code"],
  dmPermission: true,
  groupPermission: true,
  execute: async ({ interaction, deps }): Promise<SlashCommandResult> => {
    const { eventTracker, code } = deps;
    const count = interaction.options.getInteger("count") ?? 3;
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;

    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });

    try {
      const embed = eventTracker.buildMissionTrackerEmbed(count);
      await interaction.editReply({ embeds: [embed] });
      return code.Success;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await interaction.editReply({
        content: `Failed to fetch mission timer: ${errorMessage}`,
      });
      return [code.UserDefinedError, errorMessage];
    }
  },
} as SlashCommand<"eventTracker" | "code">;
