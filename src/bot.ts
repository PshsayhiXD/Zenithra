import { Events } from "discord.js";
import client from "@/client.js";
import "@database/index.js";
import "@environment";
import { runPendingMigrations } from "@database/migrate.js";
import { createLogger } from "@utilities/logger.js";

const log = {
  process:  createLogger("Process"),
  database: createLogger("Database"),
  bot:      createLogger("Bot"),
};

process.on("uncaughtException", (error: Error): void => {
  log.process.error(error, { event: "uncaughtException" });
});
process.on("unhandledRejection", (error: Error): void => {
  log.process.error(error, { event: "unhandledRejection" });
});

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async function boot(): Promise<void> {
  const executed = runPendingMigrations();
  if (executed.length > 0) {
    log.database.info(`Applied ${String(executed.length)} migrations`, { migrations: executed });
  }

  const { loadCommands, readCommands } = await import("./command/_commands.js");
  const { loadSlashCommands, readSlashCommands } =
    await import("./command/_slashCommands.js");

  const { onClientReady }       = await import("./events/_clientReady.js");
  const { onInteractionCreate } = await import("./events/_interactionCreate.js");
  const { onMessageCreate }     = await import("./events/_messageCreate.js");

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
  await loadSlashCommands([...slashCmds.global, ...slashCmds.guild]);

  log.bot.info(`Loaded ${String(cmds.length)} legacy commands`);
  log.bot.info(`Loaded ${String(slashCmds.global.length)} global slash commands`);
  log.bot.info(`Loaded ${String(slashCmds.guild.length)} guild slash commands`);

  const { loadAllItems } = await import("./modules/items/inventory.js");
  await loadAllItems();
  log.bot.info("Loaded items registry");

  const token = process.env["DISCORD_BOT_TOKEN"];
  if (token === undefined || token === "") throw new Error("Missing DISCORD_BOT_TOKEN.");
  await client.login(token);
})();