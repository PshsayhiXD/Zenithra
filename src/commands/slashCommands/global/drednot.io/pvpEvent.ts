import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import type { SlashCommand, SlashCommandResult } from "@commands/types/slashCommand.js";
import { type PvpQuery } from "@handlers/pvpEventTracker/type.js";

const formatTimestamp = (t: number): string =>
  `<t:${String(Math.floor(t / 1000))}:F> (<t:${String(Math.floor(t / 1000))}:R>)`;

export default {
  shouldRegister: true,
  name: "pvpevent",
  id: 2,
  category: "drednot.io",
  description: "Shows the next pvp event.",
  args: [
    {
      name: "query",
      description: "The query to use for the pvp event. (default: next)",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: "next", value: "next" },
        { name: "all", value: "all" },
        { name: "today", value: "today" },
        { name: "tomorrow", value: "tomorrow" },
      ],
    },
    {
      name: "ephemeral",
      description: "Whether the response should be ephemeral.",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  permission: {},
  dependencies: ["pvpEvent", "createEmbed", "code"],
  dmPermission: true,
  groupPermission: true,
  execute: async ({ interaction, deps }): Promise<SlashCommandResult> => {
    const { pvpEvent, createEmbed, code } = deps;
    const query = (interaction.options.getString("query") ?? "next") as PvpQuery;
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;

    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });

    const nextPvpEvent = pvpEvent.calcPvpEvent(query);

    let resultString: string;
    if (nextPvpEvent instanceof Error) {
      resultString = `❌ ${nextPvpEvent.message}`;
    } else if (Array.isArray(nextPvpEvent)) {
      resultString = nextPvpEvent.length === 0
        ? "No events found."
        : nextPvpEvent
            .map(event => `${event.server.type} Server ${String(event.server.id)} • ${formatTimestamp(event.time)}`)
            .join("\n");
    } else {
      resultString = `${nextPvpEvent.server.type} Server ${String(nextPvpEvent.server.id)} • ${formatTimestamp(nextPvpEvent.time)}`;
    }

    await interaction.editReply({
      embeds: [
        createEmbed({
          title: "PvP Event(s)",
          description: resultString,
          color: "Green",
          footer: {
            text: "PvP Events Tracker",
            iconURL: interaction.user.displayAvatarURL(),
          },
          options: {
            timestamp: new Date(),
          },
        }),
      ],
    });
    return code.Success;
  },
} as SlashCommand<"pvpEvent" | "createEmbed" | "code">;
