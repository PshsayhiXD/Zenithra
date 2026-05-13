import type { EmbedBuilder } from "discord.js";
import createEmbed from "@utilities/components/embedComponent.js";
import { getMissionTrackerData } from "@handlers/missionTracker/missions.js";
import type { MissionTrackerData } from "@handlers/missionTracker/type.js";
import { PvPServerEmoji } from "@handlers/pvpEventTracker/type.js";

const serverLabel = {
  persistent: "Persistent",
  test: "Test",
  wipe: "Wipe",
} as const;

const serverOrder = ["persistent", "wipe", "test"] as const;

export const createMissionTrackerEmbed = (
  data: MissionTrackerData,
): EmbedBuilder => {
  const { state, futureMissions, trackedServers } = data;
  const isOpen = state.state === "OPEN";
  const trackedServerValue = serverOrder
    .map((server) => {
      const mission = trackedServers[server];
      if (mission === undefined) return null;
      const emoji = server === "wipe" ? PvPServerEmoji.ephemeral : PvPServerEmoji[server];
      return `${emoji} ${serverLabel[server]}: \`${mission.mission}\``;
    })
    .filter((value): value is string => value !== null)
    .join(" • ");
  const futureValue =
    futureMissions.length > 0
      ? futureMissions
          .map((mission, index) => `#${String(index + 1)} <t:${String(mission.open)}:R> → <t:${String(mission.close)}:R>`)
          .join(" • ")
      : "No future persistent missions available.";
  const overviewValue = [
    `${isOpen ? "🟢" : "🔴"} **${isOpen ? "OPEN" : "CLOSED"}**`,
    `⏳ <t:${String(Math.floor(Date.now() / 1000) + state.timeLeft)}:R>`,
  ].join("\n");
  return createEmbed({
    title: "Mission Tracker",
    description: "＞︿＜ Live mission tracking across all servers.",
    color: isOpen ? "Green" : "Red",
    fields: [
      {
        name: "📊 Overview",
        value: overviewValue,
        inline: true,
      },
      {
        name: "🔢 Tracked Servers",
        value: trackedServerValue || "No mission data yet.",
        inline: true,
      },
      {
        name: "📅 Upcoming Missions",
        value: futureValue,
        inline: true,
      },
    ],
    footer: {
      text: "Mission Tracker Dashboard",
    },
    options: {
      timestamp: new Date(),
    },
  });
};

export const buildMissionTrackerEmbed = (
  count = 6,
): EmbedBuilder => createMissionTrackerEmbed(getMissionTrackerData(count));

export {
  getFutureMissions,
  getMissionState,
  getMissionTrackerData,
} from "@handlers/missionTracker/missions.js";

export { missionStore } from "@handlers/missionTracker/store.js";

export type {
  MissionData,
  FutureMission,
  MissionServer,
  MissionState,
  MissionStoreData,
  MissionTrackerData,
} from "@handlers/missionTracker/type.js";
