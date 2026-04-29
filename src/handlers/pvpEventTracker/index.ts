import createEmbed from "@utilities/ui/embed.js";
import type { EmbedBuilder } from "discord.js";
import { toDiscordTimestamp } from "@utilities/time.js";

type EventInput = string | number | (string | number)[];

const base = {
  title: "PVP Events",
  options: { timestamp: new Date() },
};

const normalizeEvents = (eventsInput: EventInput): (string | number)[] => Array.isArray(eventsInput) ? eventsInput : [eventsInput];

export const buildPvpEventEmbed = (events: EventInput | Error): EmbedBuilder => {
  if (events instanceof Error)
    return createEmbed({
      ...base,
      description: `❌ ${events.message}`,
      color: "Red",
    });

  const list = normalizeEvents(events);

  return createEmbed({
    title: "PvP Event(s)",
    description: list.map((v) => toDiscordTimestamp(v)).join("\n"),
    color: "Grey",
    footer: {
      text: "PvP Events Tracker • 5m",
    },
    options: {
      timestamp: new Date(),
    },
  });
};

export {calcPvpEvent, scrapPvpEvent} from "./pvpEvent";
