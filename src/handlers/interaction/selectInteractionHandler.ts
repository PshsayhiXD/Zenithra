import type { StringSelectMenuInteraction } from "discord.js";
import { selectCache } from "@handlers/interaction/cache/selectCache.js";
import type { AddSelectRecordOptions } from "@handlers/interaction/types/selectInteraction.js";
import {
  registerSelectHandler,
  selectHandlerRegistry,
  transientSelectRegistry,
} from "@handlers/interaction/registry.js";
import { routeComponentInteraction } from "@handlers/interaction/router.js";
import { createLogger } from "@utilities/logger.js";

const log = createLogger("SelectInteraction");

export const addSelectRecord = ({
  customId,
  handlerKey,
  metadata,
  onSelect,
  options,
  ttlMs,
}: AddSelectRecordOptions): void => {
  if (onSelect !== undefined) {
    const transientRecord =
      options === undefined
        ? { handler: onSelect }
        : { handler: onSelect, options };

    transientSelectRegistry.set(customId, transientRecord);
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

  selectCache.set(customId, persistentRecord, ttlMs);
};

export const handleSelectInteraction = async (
  interaction: StringSelectMenuInteraction,
): Promise<void> => {
  try {
    await routeComponentInteraction({
      interaction,
      persistentCache: selectCache,
      persistentHandlers: selectHandlerRegistry,
      transientHandlers: transientSelectRegistry,
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

export { registerSelectHandler };
