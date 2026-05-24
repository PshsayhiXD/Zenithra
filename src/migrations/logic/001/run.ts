import type { Client } from "discord.js";
import { User as UserTable } from "@tables/index.js";
import {
  createUsernameMigrationButtons,
  createUsernameMigrationEmbed,
} from "@Rmigrations/logic/001/messages.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("UsernameMigration");

export const sendUsernameMigrationDm = async (
  client: Client,
  discordId: string,
): Promise<boolean> => {
  try {
    const user = await client.users.fetch(discordId);
    await user.send({
      embeds: [createUsernameMigrationEmbed()],
      components: [createUsernameMigrationButtons(discordId)],
    });
    UserTable.markUsernameMigrationPrompted(discordId);
    return true;
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));

    logger.warn(error_.message, {
      discordId,
      error: error_.message,
      phase: "send_dm",
    });

    return false;
  }
};

export const addUsernames = async (client: Client): Promise<boolean> => {
  const users = UserTable.getUsersMissingUsername();
  let sent = 0;

  for (const user of users) {
    const wasSent = await sendUsernameMigrationDm(client, user.id);
    if (wasSent) sent += 1;
  }

  logger.info("Username migration run finished", {
    attempted: users.length,
    sent,
  });

  return sent >= 0;
};
