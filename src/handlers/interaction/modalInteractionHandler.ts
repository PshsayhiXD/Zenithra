import type { ModalSubmitInteraction } from "discord.js";
import { modalCache } from "@/handlers/interaction/cacher/modalCache.js";
import {
  modalHandlerRegistry,
  registerModalHandler,
  transientModalRegistry,
} from "@handlers/interaction/registry.js";
import { routeComponentInteraction } from "@handlers/interaction/router.js";
import type { AddModalRecordOptions } from "@handlers/interaction/types/modalInteraction.js";
import { createLogger } from "@utilities/logger.js";

const log = createLogger("ModalInteraction");

export const addModalRecord = ({
  customId,
  handlerKey,
  metadata,
  onSubmit,
  options,
  ttlMs,
}: AddModalRecordOptions): void => {
  if (onSubmit !== undefined) {
    const transientRecord =
      options === undefined
        ? { handler: onSubmit }
        : { handler: onSubmit, options };

    transientModalRegistry.set(customId, transientRecord);
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

  modalCache.set(customId, persistentRecord, ttlMs);
};

export const handleModalInteraction = async (
  interaction: ModalSubmitInteraction,
): Promise<void> => {
  try {
    await routeComponentInteraction({
      interaction,
      persistentCache: modalCache,
      persistentHandlers: modalHandlerRegistry,
      transientHandlers: transientModalRegistry,
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

export { registerModalHandler };
