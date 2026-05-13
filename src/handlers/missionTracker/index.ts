import type { EmbedBuilder } from "discord.js";
import createEmbed from "@/utilities/components/embedComponent.js";
import { getMissionTrackerData } from "@handlers/missionTracker/missions.js";
import type { MissionState, FutureMission } from "@handlers/missionTracker/type.js";

export const createMissionTrackerEmbed = (
  data: MissionState,
  futureMissions: FutureMission[] = [],
): EmbedBuilder => {
  const futureValue =
    futureMissions.length > 0
      ? futureMissions
          .map(
            (m, index) =>
              `**#${String(index + 1)}**: 🟢 Open: <t:${String(m.open)}:R> | 🔴 Close: <t:${String(m.close)}:R>`,
          )
          .join("\n")
      : "No future missions available.";

  const parsedState = data.state === "OPEN" ? "🟢 Open" : "🔴 Closed";

  const fields = [
    {
      name: "State",
      value: `**${parsedState}**`,
      inline: true,
    },
    {
      name: "Time Left",
      value: `<t:${String(Math.floor(Date.now() / 1000) + data.timeLeft)}:R>`,
      inline: true,
    },
    {
      name: "Next Change",
      value: `<t:${String(data.nextChange)}:R>`,
      inline: true,
    },
    {
      name: "Future Missions",
      value: futureValue,
      inline: false,
    },
  ];

  if (data.missionName !== null) {
    fields.unshift({
      name: "Mission",
      value: `**${data.missionName}**`,
      inline: true,
    });
  }

  return createEmbed({
    title: "Mission Tracker",
    description: `＞︿＜ Current mission: **\`${data.missionName ?? "None"}\`**.`,
    color: data.state === "OPEN" ? "Green" : "Red",
    fields,
    footer: {
      text: "• Mission Tracker",
    },
    options: {
      timestamp: new Date(),
    },
  });
};

export const buildMissionTrackerEmbed = (count = 3): EmbedBuilder => {
  const { state, futureMissions } = getMissionTrackerData(count);
  return createMissionTrackerEmbed(state, futureMissions);
};

export {
  getFutureMissions,
  getMissionState,
  getMissionTrackerData,
} from "@/handlers/missionTracker/missions.js";
export { missionStore } from "@/handlers/missionTracker/store.js";
export type {
  MissionData,
  FutureMission,
  MissionState,
} from "@/handlers/missionTracker/type.js";
