import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";
import { PermissionFlagsBits } from "discord.js";

export default defineLegacyCommand({
  name: "setmission",
  id: 2,
  category: "drednot.io",
  args: [
    {
      name: "mission",
      description: "The mission name.",
      type: "string",
      required: true,
    },
  ],
  aliases: [],
  permission: {
    discord: PermissionFlagsBits.Administrator,
  },
  cooldown: 10,
  description: "Sets the current mission name while preserving the timer and location. (Admins only)",
  dependencies: ["eventTracker", "components", "code"],
  execute: async ({ message, args, deps, isDiscord }): Promise<CommandResult> => {
    const { eventTracker, components, code } = deps;
    const { missionStore } = eventTracker;

    if (!isDiscord) return [code.UserDefinedError, "This command currently only supports Discord."];

    if (args[0] === undefined || args[0] === "") return [code.UserDefinedError, "Please provide a mission name."];
    const missionName = args.join(" ");
    const current = missionStore.getServer("persistent");
    const startTime = current?.startTime ?? Math.floor(Date.now() / 1000);

    const currentServers = missionStore.get()?.servers;

    missionStore.setServers({
      ...currentServers,
      persistent: {
        mission: missionName,
        location: current?.location ?? "Raven",
        startTime,
        setAt: Date.now(),
      },
    });

    const payload = {
      embeds: [
        components.createEmbed({
          title: "Mission Name Updated",
          description: `Successfully updated mission name.\n**Mission**: ${missionName}\n**Location**: ${current?.location ?? "Raven"}\n**Status**: Timer preserved.`,
          color: "Green",
          options: {
            ...(message ? { message } : {}),
            timestamp: new Date(),
          },
        }),
      ],
    };
    if (message) await message.reply(payload);
    return code.Success;
  },
});
