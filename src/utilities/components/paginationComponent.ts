import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";
import type { PaginationOptions } from "@utilities/components/types/paginationComponent.js";

const registerButton = (
  customId: string,
  onClick: Parameters<typeof addButtonRecord>[0]["onClick"] | undefined,
  single: boolean | undefined,
): void => {
  if (onClick === undefined) return;
  addButtonRecord({
    customId,
    onClick,
    ...(single === undefined ? {} : { options: { single } }),
  });
};

export const createPaginationComponent = (
  options: PaginationOptions,
): ActionRowBuilder<ButtonBuilder> => {
  const firstCustomId = options.firstCustomId ?? `${options.previousCustomId}:first`;
  const lastCustomId = options.lastCustomId ?? `${options.nextCustomId}:last`;

  const firstButton = new ButtonBuilder()
    .setCustomId(firstCustomId)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.firstLabel ?? "⇐")
    .setDisabled(options.currentPage <= 1);

  const previousButton = new ButtonBuilder()
    .setCustomId(options.previousCustomId)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.previousLabel ?? "←")
    .setDisabled(options.currentPage <= 1);

  const nextButton = new ButtonBuilder()
    .setCustomId(options.nextCustomId)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.nextLabel ?? "→")
    .setDisabled(options.currentPage >= options.totalPages);

  const lastButton = new ButtonBuilder()
    .setCustomId(lastCustomId)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(options.lastLabel ?? "⇒")
    .setDisabled(options.currentPage >= options.totalPages);

  if (options.previousEmoji !== undefined)
    previousButton.setEmoji(options.previousEmoji);

  if (options.nextEmoji !== undefined)
    nextButton.setEmoji(options.nextEmoji);

  registerButton(firstCustomId, options.onFirstClick, options.single);
  registerButton(options.previousCustomId, options.onPreviousClick, options.single);
  registerButton(options.nextCustomId, options.onNextClick, options.single);
  registerButton(lastCustomId, options.onLastClick, options.single);

  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(firstButton, previousButton, nextButton, lastButton);
};
