import createEmbed from "@/utilities/components/embedComponent.js";

import type { EmbedBuilder } from "discord.js";
import type {
  PvpEventResult,
} from "@handlers/pvpEventTracker/type.js";

import {
  toDiscordTimestamp,
} from "@utilities/time.js";

export const buildPvpEventEmbed = (
  events:
    | PvpEventResult
    | PvpEventResult[]
    | Error,
): EmbedBuilder => {
  if (events instanceof Error) {
    return createEmbed({
      title: "PvP Events",
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
      title: "PvP Events",
      description: "❌ No PvP events found.",
      color: "Red",
      options: {
        timestamp: new Date(),
      },
    });
  }

  return createEmbed({
    title: "PvP Event(s)",
    description: list
      .map(
        (event): string =>
          [
            `${event.server.type} Server ${String(event.server.id)}`,
            toDiscordTimestamp(event.time),
          ].join(" • "),
      )
      .join("\n"),
    color: "Grey",
    footer: {
      text: "PvP Events Tracker • 5m",
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
