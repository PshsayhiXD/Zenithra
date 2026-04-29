import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import type { SlashCommand } from "@command/types/slashCommand";
import type { CodeNumber } from "@command/dependencies";

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
  execute: async ({ interaction, deps }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { pvpEvent, createEmbed, code } = deps;
    const query = interaction.options.getString("query") ?? "next";
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;
    let resultString: string;
    await interaction.deferReply({
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });
    const nextPvpEvent = pvpEvent.calcPvpEvent(query);
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const formatTimestamp = (t: number): string =>
      `<t:${String(Math.floor(t / 1000))}:F> (<t:${String(Math.floor(t / 1000))}:R>)`;
    if (Array.isArray(nextPvpEvent)) {
      resultString = nextPvpEvent.length === 0 ? "No events found." : nextPvpEvent.map(t => formatTimestamp(t)).join("\n");
    } else resultString = formatTimestamp(nextPvpEvent);

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
