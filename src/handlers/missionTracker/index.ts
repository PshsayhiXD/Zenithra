import type { EmbedBuilder } from "discord.js";
import createEmbed from "@utilities/components/embedComponent.js";
import { getMissionTrackerData } from "@handlers/missionTracker/missions.js";
import type { MissionTrackerData } from "@handlers/missionTracker/type.js";

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

  const trackedServerValue = serverOrder
    .map((server) => {
      const mission = trackedServers[server];
      if (mission === undefined) return null;
      return `**${serverLabel[server]}**: \`${mission.mission}\``;
    })
    .filter((value): value is string => value !== null)
    .join("\n");

  const futureValue =
    futureMissions.length > 0
      ? futureMissions
          .map(
            (mission, index) =>
              `**#${String(index + 1)}**: Open <t:${String(mission.open)}:R> | Close <t:${String(mission.close)}:R>`,
          )
          .join("\n")
      : "Persistent mission forecasting is unavailable.";

  const parsedState = state.state === "OPEN" ? "Open" : "Closed";

  const fields = [
    {
      name: "Tracked Servers",
      value: trackedServerValue || "No Interstellar mission data yet.",
      inline: false,
    },
    {
      name: "Persistent State",
      value: `**${parsedState}**`,
      inline: true,
    },
    {
      name: "Persistent Time Left",
      value: `<t:${String(Math.floor(Date.now() / 1000) + state.timeLeft)}:R>`,
      inline: true,
    },
    {
      name: "Persistent Next Change",
      value: `<t:${String(state.nextChange)}:R>`,
      inline: true,
    },
    {
      name: "Persistent Future Missions",
      value: futureValue,
      inline: false,
    },
  ];

  if (state.missionName !== null) {
    fields.unshift({
      name: "Persistent Mission",
      value: `**${state.missionName}**`,
      inline: true,
    });
  }

  return createEmbed({
    title: "Mission Tracker",
    description:
      "Tracks Interstellar missions for persistent, wipe, and test. Manual timing is limited to persistent for now.",
    color: state.state === "OPEN" ? "Green" : "Red",
    fields,
    footer: {
      text: "Mission Tracker",
    },
    options: {
      timestamp: new Date(),
    },
  });
};

export const buildMissionTrackerEmbed = (count = 3): EmbedBuilder =>
  createMissionTrackerEmbed(getMissionTrackerData(count));

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
