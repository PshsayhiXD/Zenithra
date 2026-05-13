import type { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";

export interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  previousCustomId: string;
  nextCustomId: string;
  previousLabel?: string;
  nextLabel?: string;
  previousEmoji?: string;
  nextEmoji?: string;
  onPreviousClick?: Parameters<typeof addButtonRecord>[0]["onClick"];
  onNextClick?: Parameters<typeof addButtonRecord>[0]["onClick"];
  single?: boolean;
}
