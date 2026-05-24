import type { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";

export interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  firstCustomId?: string;
  previousCustomId: string;
  nextCustomId: string;
  lastCustomId?: string;
  firstLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  lastLabel?: string;
  previousEmoji?: string;
  nextEmoji?: string;
  onFirstClick?: Parameters<typeof addButtonRecord>[0]["onClick"];
  onPreviousClick?: Parameters<typeof addButtonRecord>[0]["onClick"];
  onNextClick?: Parameters<typeof addButtonRecord>[0]["onClick"];
  onLastClick?: Parameters<typeof addButtonRecord>[0]["onClick"];
  single?: boolean;
}
