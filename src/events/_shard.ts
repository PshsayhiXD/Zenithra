import type { Shard } from "discord.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("Shard");

export const onShardCreate = (shard: Shard): void => {
  logger.info("Shard spawned", { shardId: shard.id });
};
