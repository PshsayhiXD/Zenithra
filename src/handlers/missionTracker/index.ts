import type { EmbedBuilder } from "discord.js";
import createEmbed from "@utilities/ui/embed.js";
import {
  getMissionTrackerData,
} from "@handlers/missionTracker/missions.js";

import type {
  MissionState,
  FutureMission,
} from "@handlers/missionTracker/type.js";

export const createMissionTrackerEmbed = (data: MissionState, futureMissions: FutureMission[] = []): EmbedBuilder => {
  const futureValue = futureMissions.length > 0
    ? futureMissions
        .map((m, index) => `**#${String(index + 1)}**: 🟢 Open: <t:${String(m.open)}:R> | 🔴 Close: <t:${String(m.close)}:R>`)
        .join("\n")
    : "No future missions available.";
  const parsedState = data.state === "OPEN" ? "🟢 Open" : "🔴 Close";
  const fields = [
    {
      name: "State",
      value: `**${parsedState}**`,
      inline: true,
    },
    {
      name: "Time Left",
      value: `<t:${String(data.nextChange)}:R>`,
      inline: true,
    },
  ];

  if (data.missionName !== null) {
    fields.unshift({
      name: "Mission",
      value: `**${data.missionName}**`,
      inline: true,
    });
  }

  fields.push(
    {
      name: "Next Change",
      value: `<t:${String(data.nextChange)}:R>`,
      inline: true,
    },
    {
      name: "Future Missions",
      value: futureValue,
      inline: false,
    }
  );

  const embed = createEmbed({
    title: data.missionName === null ? "Mission Tracker" : `Mission Tracker: ${data.missionName}`,
    description: "Real-time mission status based on game calculations.",
    color: data.state === "OPEN" ? "Green" : "Red",
    fields,
    footer: {
      text: "Mission Tracker • If timers are off, contact pshsayhi4117",
    },
    options: {
      timestamp: new Date(),
    },
  });
  return embed;
};

export const buildMissionTrackerEmbed = async (count = 3): Promise<EmbedBuilder> => {
  const { state, futureMissions } = await getMissionTrackerData(count);
  return createMissionTrackerEmbed(state, futureMissions);
};
export {getFutureMissions, getMissionState, getMissionTrackerData} from "./missions.js";
export {missionStore as missionCache} from "./store.js";
export {type MissionData, type FutureMission, type MissionState} from "./type.js";