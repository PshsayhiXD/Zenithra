import type { Client } from "discord.js";
import type { ScheduleEntry } from "@handlers/pvpEventTracker/type";

import { buildMissionTrackerEmbed } from "@handlers/missionTracker";
import { buildPvpEventEmbed, calcPvpEvent } from "@handlers/pvpEventTracker";
import { buildPublicCombinedShips } from "@handlers/shipTracker";

import { updateCache } from "@/client.js";
import { Cache } from "@utilities/cache.js";
import { time } from "@utilities/index.js";
import { createLogger } from "@utilities/logger.js";

import { registerSlashCommands } from "@command/_registerSlashCommand.js";
import { startMissionTracker } from "@services/missionTracker.js";
import { startPvpEventTracker } from "@services/pvpEventTracker.js";
import { startShipTracker } from "@services/shipTracker.js";

let hasStarted = false;
const log = createLogger("Ready");
export const onClientReady = async (client: Client): Promise<void> => {
  if (hasStarted) {
    log.warn("Already started");
    return;
  }
  hasStarted = true;
  const shardId = client.shard?.ids[0] ?? 0;
  const isFirstShard = shardId === 0;

  log.info("Client ready", {
    shardId,
    userTag: client.user?.tag ?? null,
  });

  try {
    if (isFirstShard) {
      log.info("Registering slash commands", { shardId });
      await registerSlashCommands(client);
      log.info("Slash commands registered", { shardId });
    }
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.error(error_, { shardId, phase: "slash_register" });
  }

  try {
    log.info("Starting services", { shardId });
    client.user?.setPresence({ status: "idle" });
    updateCache();
    const pvpCache = new Cache<ScheduleEntry>("pvpEventSchedule", "file");
    const pvpResult = calcPvpEvent("all");

    if (!(pvpResult instanceof Error)) {
      const now = Date.now();
      const upcoming = (Array.isArray(pvpResult) ? pvpResult : [pvpResult])
        .filter(t => t > now)
        .slice(0, 4);
      pvpCache.set("pvpEventSchedule", { date: upcoming });
      const pvpEmbed = buildPvpEventEmbed(upcoming);
      await startPvpEventTracker(pvpEmbed);
      log.info("PVP tracker initialized", {
        shardId,
        upcomingCount: upcoming.length,
      });
    }

    const [eventEmbed, shipPng] = await Promise.all([
      buildMissionTrackerEmbed(15),
      buildPublicCombinedShips(),
    ]);
    await Promise.all([
      startMissionTracker(eventEmbed),
      startShipTracker(shipPng),
    ]);
    log.info("Initial services started", { shardId });
    time.loop(async (): Promise<void> => {
      const [newEventEmbed, newShipPng] = await Promise.all([
        buildMissionTrackerEmbed(15),
        buildPublicCombinedShips(),
      ]);
      await Promise.all([
        startMissionTracker(newEventEmbed),
        startShipTracker(newShipPng),
      ]);
      log.info("Periodic mission/ship update", { shardId });
    }, time.MINUTE / 2);

    time.loop(async (): Promise<void> => {
      updateCache();
      const newPvpResult = calcPvpEvent("all");
      if (!(newPvpResult instanceof Error)) {
        const now = Date.now();
        const upcoming = (Array.isArray(newPvpResult) ? newPvpResult : [newPvpResult])
          .filter((t: number): boolean => t > now)
          .slice(0, 4);
        pvpCache.set("pvpEventSchedule", { date: upcoming });
        const pvpEmbed = buildPvpEventEmbed(upcoming);
        await startPvpEventTracker(pvpEmbed);
        log.info("Periodic PVP update", {
          shardId,
          upcomingCount: upcoming.length,
        });
      }
    }, time.MINUTE * 5);

  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.error(error_, { shardId, phase: "service_start" });
  }
};
