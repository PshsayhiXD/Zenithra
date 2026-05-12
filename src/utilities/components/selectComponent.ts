import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  type APISelectMenuOption,
} from "discord.js";

import { addSelectRecord } from "@handlers/interaction/selectInteractionHandler.js";

export interface SelectComponentOptions {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  options: APISelectMenuOption[];
  onSelect?: Parameters<typeof addSelectRecord>[0]["onSelect"];
  single?: boolean;
}

export const createSelectComponent = (
  options: SelectComponentOptions,
): ActionRowBuilder<StringSelectMenuBuilder> => {
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

  if (options.onSelect !== undefined) {
    addSelectRecord({
      customId: options.customId,
      onSelect: options.onSelect,
      ...(options.single === undefined
        ? {}
        : { options: { single: options.single } }),
    });
  }

  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(select);
};
