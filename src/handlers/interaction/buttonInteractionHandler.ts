import type { ButtonInteraction } from "discord.js";
import { buttonCache } from "@handlers/interaction/cache/buttonCache.js";
import type { AddButtonRecordOptions } from "@handlers/interaction/types/buttonInteraction.js";
import {
  buttonHandlerRegistry,
  registerButtonHandler,
  transientButtonRegistry,
} from "@handlers/interaction/registry.js";
import { routeComponentInteraction } from "@handlers/interaction/router.js";
import { createLogger } from "@utilities/logger.js";

const log = createLogger("ButtonInteraction");

export const addButtonRecord = ({
  customId,
  handlerKey,
  metadata,
  onClick,
  options,
  ttlMs,
}: AddButtonRecordOptions): void => {
  if (onClick !== undefined) {
    const transientRecord =
      options === undefined
        ? { handler: onClick }
        : { handler: onClick, options };

    transientButtonRegistry.set(customId, transientRecord);
  }

  if (handlerKey === undefined) return;

  if (options?.persist === false) return;

  const persistentRecord =
    metadata === undefined && options === undefined
      ? { customId, handlerKey }
      : {
        customId,
        handlerKey,
        ...(metadata === undefined ? {} : { metadata }),
        ...(options === undefined ? {} : { options }),
      };

  buttonCache.set(customId, persistentRecord, ttlMs);
};

export const handleButtonInteraction = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  try {
    await routeComponentInteraction({
      interaction,
      persistentCache: buttonCache,
      persistentHandlers: buttonHandlerRegistry,
      transientHandlers: transientButtonRegistry,
    });
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.error(error_, {
      customId: interaction.customId,
      userId: interaction.user.id,
      guildId: interaction.guildId ?? undefined,
    });
  }
};

export { registerButtonHandler };
