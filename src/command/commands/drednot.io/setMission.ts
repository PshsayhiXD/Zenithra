import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";
import { PermissionFlagsBits } from "discord.js";

export default {
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
  dependencies: ["eventTracker", "createEmbed", "code"],
  execute: async ({ message, args, deps }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { eventTracker, createEmbed, code } = deps;
    const { missionCache } = eventTracker;

    if (args[0] === undefined || args[0] === "") return [code.UserDefinedError, "Please provide a mission name."];
    const missionName = args.join(" ");
    const current = missionCache.get();
    const startTime = current?.startTime ?? Math.floor(Date.now() / 1000);

    missionCache.set({
      mission: missionName,
      location: current?.location ?? "Raven",
      startTime,
      setAt: Date.now(),
      version: 0,
    });

    await message.reply({
      embeds: [
        createEmbed({
          title: "Mission Name Updated",
          description: `Successfully updated mission name.\n**Mission**: ${missionName}\n**Location**: ${current?.location ?? "Raven"}\n**Status**: Timer preserved.`,
          color: "Green",
          footer: {
            text: `Updated by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL(),
          },
          options: {
            timestamp: new Date(),
          },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"eventTracker" | "createEmbed" | "code">;
