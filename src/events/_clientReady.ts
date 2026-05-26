import type { Client } from "discord.js";

import { buildMissionTrackerEmbed } from "@handlers/missionTracker/index.js";
import { buildPvpEventEmbed, calcPvpEvent } from "@handlers/pvpEventTracker/index.js";
import { buildPublicCombinedShips } from "@handlers/shipTracker/index.js";

import { updateCache } from "@/client.js";
import { loop, MINUTE } from "@utilities/time.js";
import { createLogger, Warning } from "@utilities/logger.js";

import { registerSlashCommands } from "@commands/_registerSlashCommand.js";
import { startMissionTracker } from "@services/missionTracker.js";
import { startPvpEventTracker } from "@services/pvpEventTracker.js";
import { startShipTracker } from "@services/shipTracker.js";
import { MISSION } from "@configs/mission.js";
import { interstellarTracker } from "@handlers/missionTracker/interstellarTracker.js";
import {
  executeRuntimeMigrations,
  registerRuntimeMigrations,
} from "@/migrations/migrate.js";

let hasStarted = false;
const logger = createLogger("Ready");
export const onClientReady = async (client: Client): Promise<void> => {
  if (hasStarted) throw new Warning("Already started", logger);
  hasStarted = true;
  const shardId = client.shard?.ids[0] ?? 0;
  const isFirstShard = shardId === 0;

  logger.info("Client ready", {
    shardId,
    userTag: client.user?.tag ?? null,
  });

  registerRuntimeMigrations();

  try {
    if (isFirstShard) {
      logger.info("Registering slash commands", { shardId });
      await registerSlashCommands(client);
      logger.info("Slash commands registered", { shardId });
      const migrationResult = await executeRuntimeMigrations(client);
      logger.info("Migration results", { shardId, migrationResult });
    }
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    logger.error(error_, { shardId, phase: "slash_register" });
  }

  try {
    logger.info("Starting services", { shardId });
    client.user?.setPresence({ status: "idle" });
    updateCache();
    if (MISSION.TRACKER.USE_INTERSTELLAR) interstellarTracker.start();
    const pvpResult = calcPvpEvent("all");

    if (!(pvpResult instanceof Error)) {
      const now = Date.now();
      const upcoming = (Array.isArray(pvpResult) ? pvpResult : [pvpResult])
        .filter(event => event.time > now)
        .slice(0, 7);
      const pvpEmbed = buildPvpEventEmbed(upcoming);
      await startPvpEventTracker(pvpEmbed);
      logger.info("PVP tracker initialized", {
        shardId,
        upcomingCount: upcoming.length,
      });
    }

    const eventEmbed = buildMissionTrackerEmbed(3);
    const shipPng = await buildPublicCombinedShips();
    await Promise.all([startMissionTracker(eventEmbed), startShipTracker(shipPng)]);
    logger.info("Initial services started", { shardId });
    loop(async (): Promise<void> => {
      const newEventEmbed = buildMissionTrackerEmbed(3);
      const newShipPng = await buildPublicCombinedShips();
      await Promise.all([startMissionTracker(newEventEmbed), startShipTracker(newShipPng)]);
    }, MINUTE / 2);

    loop(async (): Promise<void> => {
      updateCache();
      const newPvpResult = calcPvpEvent("all");
      if (!(newPvpResult instanceof Error)) {
        const now = Date.now();
        const list = Array.isArray(newPvpResult) ? newPvpResult : [newPvpResult];
        const upcoming = list.filter(event => event.time > now).slice(0, 4);

        const pvpEmbed = buildPvpEventEmbed(upcoming);
        await startPvpEventTracker(pvpEmbed);

        logger.info("PVP tracker initialized", {
          shardId,
          upcomingCount: upcoming.length,
        });
      }
    }, MINUTE * 5);
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    logger.error(error_, { shardId, phase: "service_start" });
  }
};
