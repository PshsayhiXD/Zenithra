import type { ButtonInteraction } from "discord.js";
import { buttonCache } from "@handlers/interaction/cache/buttonCache.js";
import type { AddButtonRecordOptions } from "@handlers/interaction/types/buttonInteraction.js";
import { createLogger } from "@utilities/logger.js";

const log = createLogger("ButtonInteraction");

export const addButtonRecord = ({
  customId,
  onClick,
  options,
  ttlMs,
}: AddButtonRecordOptions): void => {
  buttonCache.set(
    customId,
    { onClick, ...(options === undefined ? {} : { options }) },
    ttlMs,
  );
};

export const handleButtonInteraction = async (
  interaction: ButtonInteraction,
): Promise<void> => {
  const record = buttonCache.get(interaction.customId);
  if (record === undefined) return;

  if (record.options?.single === true) buttonCache.delete(interaction.customId);

  try {
    await record.onClick(interaction);
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.error(error_, {
      customId: interaction.customId,
      userId: interaction.user.id,
      guildId: interaction.guildId ?? undefined,
    });
  }
};
