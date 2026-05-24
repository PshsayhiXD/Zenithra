import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";
import { REST, Routes, type Client } from "discord.js";

import { readSlashCommands } from "@commands/_slashCommands.js";
import { createHash } from "@utilities/crypto.js";
import { createLogger } from "@utilities/logger.js";
import { serializeSlashCommand } from "@commands/slashCommandHelper.js";
import { readSlashCommandHashCache, writeSlashCommandHashCache } from "@commands/slashCommandCache.js";
import type { SlashCommand } from "@commands/types/slashCommand.js";

const logger = createLogger("Slash");

export const registerSlashCommands = async (client: Client): Promise<void> => {
  if (client.user === null) throw new Error("Client user is not ready.");
  const force = process.argv.includes("--force");
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (token === undefined) throw new Error("Missing DISCORD_BOT_TOKEN.");

  const { global, guild } = (await readSlashCommands()) as {
    global: SlashCommand[];
    guild: SlashCommand[];
  };

  const rest = new REST({ version: "10" }).setToken(token);
  const appId = client.user.id;

  const globalCommands = global.map(
    (cmd): RESTPostAPIApplicationCommandsJSONBody => serializeSlashCommand(cmd),
  );

  const unguildedCommands = guild
    .filter(c => !("guildId" in c) || typeof c.guildId !== "string")
    .map((cmd): RESTPostAPIApplicationCommandsJSONBody => serializeSlashCommand(cmd));

  const guildMap = new Map<string, RESTPostAPIApplicationCommandsJSONBody[]>();

  for (const command of guild) {
    if (!("guildId" in command) || typeof command.guildId !== "string") continue;
    const list = guildMap.get(command.guildId) ?? [];
    list.push(serializeSlashCommand(command));
    guildMap.set(command.guildId, list);
  }

  for (const [guildId, list] of guildMap)
    guildMap.set(guildId, [...list, ...unguildedCommands]);

  const cache = readSlashCommandHashCache();
  let guilds = cache.guilds ?? (cache.guilds = {});
  const failedGuilds = new Set<string>();

  const globalHash = createHash(globalCommands);

  if (force || cache.global !== globalHash) {
    logger.info("Updating global commands", { count: globalCommands.length, force });
    await rest.put(Routes.applicationCommands(appId), { body: globalCommands });
    cache.global = globalHash;
    writeSlashCommandHashCache(cache);
  } else logger.info("Global commands unchanged");

  for (const [guildId, guildCommands] of guildMap) {
    if (failedGuilds.has(guildId)) {
      logger.info("Skipping blacklisted guild", { guildId });
      continue;
    }

    const guildHash = createHash(guildCommands);

    if (!force && cache.guilds[guildId] === guildHash) {
      logger.info("Guild unchanged", { guildId });
      continue;
    }

    logger.info("Updating guild commands", {
      guildId,
      count: guildCommands.length,
      force,
    });

    try {
      await rest.put(Routes.applicationGuildCommands(appId, guildId), {
        body: guildCommands,
      });

      cache.guilds[guildId] = guildHash;
      writeSlashCommandHashCache(cache);
    } catch (error: unknown) {
      if (
        error !== null &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === 50_001 || error.code === 10_004)
      ) {
        logger.warn("Removing invalid guild permanently", { guildId });

        failedGuilds.add(guildId);

        const { [guildId]: _, ...restGuilds } = guilds;
        guilds = restGuilds;

        writeSlashCommandHashCache(cache);
        continue;
      }

      const error_ = error instanceof Error ? error : new Error(String(error));
      logger.error(error_, { guildId });
      throw error_;
    }
  }

  const existingGuildIds = new Set(guildMap.keys());

  for (const guildId of Object.keys(guilds)) {
    if (existingGuildIds.has(guildId)) continue;

    logger.info("Clearing removed guild scope", { guildId });

    try {
      await rest.put(Routes.applicationGuildCommands(appId, guildId), {
        body: [],
      });

      const { [guildId]: _, ...restGuilds } = guilds;
      guilds = restGuilds;

      writeSlashCommandHashCache(cache);
    } catch (error: unknown) {
      if (
        error !== null &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === 50_001 || error.code === 10_004)
      ) {
        logger.warn("Removing invalid guild permanently", { guildId });

        const { [guildId]: _, ...restGuilds } = guilds;
        guilds = restGuilds;

        writeSlashCommandHashCache(cache);
        continue;
      }

      const error_ = error instanceof Error ? error : new Error(String(error));
      logger.error(error_, { guildId });
      throw error_;
    }
  }
};
