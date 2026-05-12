import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { addButtonRecord } from "@/handlers/interaction/buttonInteractionHandler.js";
import type { PaginationOptions } from "@utilities/components/types/paginationComponent.js";

export const createPaginationComponent = (
  options: PaginationOptions,
): ActionRowBuilder<ButtonBuilder> => {
  const previousButton = new ButtonBuilder()
    .setCustomId(options.previousCustomId)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.previousLabel ?? "Previous")
    .setDisabled(options.currentPage <= 1);

  const nextButton = new ButtonBuilder()
    .setCustomId(options.nextCustomId)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.nextLabel ?? "Next")
    .setDisabled(options.currentPage >= options.totalPages);

  if (options.previousEmoji !== undefined)
    previousButton.setEmoji(options.previousEmoji);

  if (options.nextEmoji !== undefined)
    nextButton.setEmoji(options.nextEmoji);

  if (options.onPreviousClick !== undefined) {
    addButtonRecord({
      customId: options.previousCustomId,
      onClick: options.onPreviousClick,
      ...(options.single === undefined
        ? {}
        : { options: { single: options.single } }),
    });
  }

  if (options.onNextClick !== undefined) {
    addButtonRecord({
      customId: options.nextCustomId,
      onClick: options.onNextClick,
      ...(options.single === undefined
        ? {}
        : { options: { single: options.single } }),
    });
  }

  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(previousButton, nextButton);
};
