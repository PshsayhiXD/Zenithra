import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";
import type { InteractionRecordOptions } from "@handlers/interaction/types/persistentInteraction.js";
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
    const onClick = options.onClick;
    let recordOptions: InteractionRecordOptions | undefined;
    if (options.single !== undefined || options.persist !== undefined) {
      recordOptions = {};
      if (options.single !== undefined) recordOptions.single = options.single;
      if (options.persist !== undefined) recordOptions.persist = options.persist;
    }
    button.setStyle(options.style).setCustomId(options.customId);
    if (options.onClick !== undefined || options.handlerKey !== undefined) {
      addButtonRecord({
        customId: options.customId,
        ...(options.handlerKey === undefined ? {} : { handlerKey: options.handlerKey }),
        ...(options.metadata === undefined ? {} : { metadata: options.metadata }),
        ...(onClick === undefined
          ? {}
          : {
            onClick: async ({ interaction }): Promise<void> => {
              await onClick(interaction);
            },
          }),
        ...(recordOptions === undefined ? {} : { options: recordOptions }),
        ...(options.ttlMs === undefined ? {} : { ttlMs: options.ttlMs }),
      });
    }
  }

  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(button);
};
