import { Events } from "discord.js";
import client from "@/client.js";
import "@databases/index.js";
import "@environment";
import { runPendingMigrations } from "@databases/migrate.js";
import { createLogger } from "@utilities/logger.js";
import net from "node:net";
import { PROXY } from "@configs/proxy.js";
import { MISSION } from "@configs/mission.js";

const log = {
  process: createLogger("Process"),
  database: createLogger("Database"),
  bot: createLogger("Bot"),
};

process.on("uncaughtException", (error: Error): void => {
  log.process.error(error, { event: "uncaughtException" });
});

process.on("unhandledRejection", (error: unknown): void => {
  log.process.error(error instanceof Error ? error : new Error(String(error)), { event: "unhandledRejection" });
});

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async function boot(): Promise<void> {
  const executed = runPendingMigrations();

  if (executed.length > 0) {
    log.database.info(`Applied ${String(executed.length)} migrations`, {
      migrations: executed,
    });
  }

  if (MISSION.TRACKER.USE_INTERSTELLAR) {
    await new Promise<void>((resolve) => {
      const socket = net.createConnection({
        port: PROXY.PORT,
        host: PROXY.HOST,
      });
      socket.once("connect", () => {
        socket.destroy();
        log.bot.info("Proxy is already running.");
        resolve();
      });
      socket.once("error", (error: unknown): void => {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ECONNREFUSED"
        ) {
          log.bot.info("Proxy is not running. Starting embedded proxy...");
          import("./proxy.js")
            .then(() => { resolve(); })
            .catch((error_: unknown) => {
              log.bot.error(
                error_ instanceof Error ? error_ : new Error(String(error_)),
                { event: "proxyStartFailed" },
              );

              resolve();
            });
          return;
        }
        log.bot.error(error instanceof Error ? error : new Error(String(error)), { event: "proxyCheckFailed" });
        resolve();
      });
    });
  }

  const { loadCommands, readCommands } =
    await import("@commands/_legacyCommands.js");
  const { loadSlashCommands, readSlashCommands } =
    await import("@commands/_slashCommands.js");

  const { onClientReady } =
    (await import("@events/_clientReady.js")) as {
      onClientReady: (callback: unknown) => Promise<void>;
    };
  const { onInteractionCreate } =
    (await import("@events/_interactionCreate.js")) as {
      onInteractionCreate: (interaction: unknown) => Promise<void>;
    };
  const { onMessageCreate } =
    (await import("@events/_messageCreate.js")) as {
      onMessageCreate: (message: unknown) => Promise<void>;
    };

  client.on("messageCreate", message => {
    void onMessageCreate(message);
  });
  client.on("interactionCreate", interaction => {
    void onInteractionCreate(interaction);
  });
  client.once(Events.ClientReady, callback => {
    void onClientReady(callback);
  });

  const cmds = await readCommands();
  await loadCommands(cmds);
  const slashCmds = await readSlashCommands();
  await loadSlashCommands([
    ...slashCmds.global,
    ...slashCmds.guild,
  ]);

  log.bot.info(`Loaded ${String(cmds.length)} legacy commands`);
  log.bot.info(`Loaded ${String(slashCmds.global.length)} global slash commands`);
  log.bot.info(`Loaded ${String(slashCmds.guild.length)} guild slash commands`);

  const { readItems, loadItems } = await import("./modules/items/_items.js");
  const itemsList = await readItems();
  loadItems(itemsList);
  log.bot.info("Loaded items registry");

  const shouldStartBackend =
    client.shard === null ||
    client.shard.ids.includes(0);

  if (shouldStartBackend) {
    const { startBackendServer } = await import("./backend/server.js");
    startBackendServer();
  }

  const token = process.env["DISCORD_BOT_TOKEN"];
  if (token === undefined || token === "") throw new Error("Missing DISCORD_BOT_TOKEN.");
  await client.login(token);
})();
