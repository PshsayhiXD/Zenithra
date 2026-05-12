import type { StringSelectMenuInteraction } from "discord.js";
import { selectCache } from "@handlers/interaction/cache/selectCache.js";
import type { AddSelectRecordOptions } from "@handlers/interaction/types/selectInteraction.js";
import { createLogger } from "@utilities/logger.js";

const log = createLogger("SelectInteraction");

export const addSelectRecord = ({
  customId,
  onSelect,
  options,
  ttlMs,
}: AddSelectRecordOptions): void => {
  selectCache.set(
    customId,
    { onSelect, ...(options === undefined ? {} : { options }) },
    ttlMs,
  );
};

export const handleSelectInteraction = async (
  interaction: StringSelectMenuInteraction,
): Promise<void> => {
  const record = selectCache.get(interaction.customId);
  if (record === undefined) return;

  if (record.options?.single === true) selectCache.delete(interaction.customId);

  try {
    await record.onSelect(interaction);
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.error(error_, {
      customId: interaction.customId,
      userId: interaction.user.id,
      guildId: interaction.guildId ?? undefined,
    });
  }
};
