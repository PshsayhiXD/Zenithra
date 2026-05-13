import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";
import type { ButtonComponentOptions } from "@utilities/components/types/buttonComponent.js";

export const createButtonComponent = (
  options: ButtonComponentOptions,
): ActionRowBuilder<ButtonBuilder> => {
  const button = new ButtonBuilder()
    .setLabel(options.label)
    .setDisabled(options.disabled ?? false);
  if (options.emoji !== undefined) button.setEmoji(options.emoji);
  if ("url" in options) button.setStyle(ButtonStyle.Link).setURL(options.url);
  else {
    button.setStyle(options.style).setCustomId(options.customId);
    if (options.onClick !== undefined) {
      addButtonRecord({
        customId: options.customId,
        onClick: options.onClick,
        ...(options.single === undefined
          ? {}
          : { options: { single: options.single } }),
      });
    }
  }

  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(button);
};
