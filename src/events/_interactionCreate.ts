import type { Interaction } from "discord.js";
import handleInteraction from "@/handlers/interaction/interactionHandler.js";
import { createLogger } from "@utilities/logger.js";

const log = createLogger("Interaction");

export const onInteractionCreate = async (interaction: Interaction): Promise<void> => {
  try {
    await handleInteraction(interaction);
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));

    log.error(error_, {
      interactionType: interaction.type,
      userId: interaction.user.id,
      guildId: interaction.guildId,
    });

    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: "There was an error handling this interaction.",
          ephemeral: true,
        });
      } catch (replyError: unknown) {
        const replyError_ = replyError instanceof Error ? replyError : new Error(String(replyError));

        log.error(replyError_, {
          phase: "interaction_reply",
          userId: interaction.user.id,
          guildId: interaction.guildId,
        });
      }
    }
  }
};
