import "@environment";
import { ShardingManager } from "discord.js";
import { onShardCreate } from "@events/_shard";
import { createLogger } from "@utilities/logger";

const logger = createLogger("Sharding");

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async function bootShards(): Promise<void> {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (token === undefined || token === "") throw new Error("Missing DISCORD_BOT_TOKEN.");
  const manager = new ShardingManager("./dist/bot.js", {
    token,
    totalShards: "auto",
    respawn: true,
  });
  manager.on("shardCreate", onShardCreate);
  logger.info("Spawning shards...");
  await manager.spawn();
  logger.info("All shards spawned successfully.");
})();
