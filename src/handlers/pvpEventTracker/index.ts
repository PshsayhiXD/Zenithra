import { createEmbed } from "@utilities/components/embedComponent.js";

import type { EmbedBuilder } from "discord.js";
import {
  type PvpEventResult,
  PvPServerEmoji,
  PvPServerName,
} from "@handlers/pvpEventTracker/type.js";

import {
  toDiscordTimestamp,
} from "@utilities/time.js";

const formatEvent = (
  event: PvpEventResult,
): string => {
  const emoji = PvPServerEmoji[event.server.type];
  const name = PvPServerName[event.server.type];
  return [
    `${emoji} **${name} Server ${String(event.server.id)}**`,
    `┗ ${toDiscordTimestamp(event.time)}`,
  ].join("\n");
};

export const buildPvpEventEmbed = (
  events:
    | PvpEventResult
    | PvpEventResult[]
    | Error,
): EmbedBuilder => {
  if (events instanceof Error) {
    return createEmbed({
      title: "⚔️ PvP Events",
      description: `❌ ${events.message}`,
      color: "Red",
      options: {
        timestamp: new Date(),
      },
    });
  }

  const list = Array.isArray(events)
    ? events
    : [events];

  if (list.length === 0) {
    return createEmbed({
      title: "⚔️ PvP Events",
      description: "❌ No PvP events found.",
      color: "Red",
      options: {
        timestamp: new Date(),
      },
    });
  }

  return createEmbed({
    title: "⚔️ PvP Events",
    description: list
      .map((event): string => formatEvent(event))
      .join("\n\n"),
    color: "Grey",
    footer: {
      text: "• pvpTracker",
    },
    options: {
      timestamp: new Date(),
    },
  });
};

export {
  calcPvpEvent,
  scrapPvpEvent,
} from "@handlers/pvpEventTracker/pvpEvent.js";
