import type { Shard } from "discord.js";
import { createLogger } from "@utilities/logger";

const log = createLogger("Shard");

export const onShardCreate = (shard: Shard): void => {
  log.info("Shard spawned", { shardId: shard.id });
};