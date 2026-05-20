import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { addSelectRecord } from "@handlers/interaction/selectInteractionHandler.js";
import type { InteractionRecordOptions } from "@handlers/interaction/types/persistentInteraction.js";
import type { SelectComponentOptions } from "@utilities/components/types/selectComponent.js";

export const createSelectComponent = (
  options: SelectComponentOptions,
): ActionRowBuilder<StringSelectMenuBuilder> => {
  let recordOptions: InteractionRecordOptions | undefined;
  if (options.single !== undefined || options.persist !== undefined) {
    recordOptions = {};
    if (options.single !== undefined) recordOptions.single = options.single;
    if (options.persist !== undefined) recordOptions.persist = options.persist;
  }
  const select = new StringSelectMenuBuilder()
    .setCustomId(options.customId)
    .setOptions(options.options)
    .setDisabled(options.disabled ?? false);

  if (options.placeholder !== undefined)
    select.setPlaceholder(options.placeholder);

  if (options.minValues !== undefined)
    select.setMinValues(options.minValues);

  if (options.maxValues !== undefined)
    select.setMaxValues(options.maxValues);

  if (options.onSelect !== undefined || options.handlerKey !== undefined) {
    addSelectRecord({
      customId: options.customId,
      ...(options.handlerKey === undefined ? {} : { handlerKey: options.handlerKey }),
      ...(options.metadata === undefined ? {} : { metadata: options.metadata }),
      ...(options.onSelect === undefined ? {} : { onSelect: options.onSelect }),
      ...(recordOptions === undefined ? {} : { options: recordOptions }),
      ...(options.ttlMs === undefined ? {} : { ttlMs: options.ttlMs }),
    });
  }

  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(select);
};
