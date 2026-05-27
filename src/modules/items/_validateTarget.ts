import {
  type ItemResult,
  type ItemTargetType,
  ItemCode
} from "@modules/types/item.js";
import { getItem } from "@modules/items/getItem.js";
import { getUser } from "@tables/user/id.js";

/**
 * Validates the target argument based on the item's targetType.
 * Returns an ItemResult error if invalid, or undefined if valid.
 *
 * - "self"    no target needed, always valid
 * - "item"    args[0] must be a valid item key
 * - "player"  args[0] must be a known userId
 * - "event"   args[0] must be a non-empty string
 */
export const validateTarget = (
  targetType: ItemTargetType | undefined,
  arguments_: string[]
): ItemResult | undefined => {
  if (targetType === undefined || targetType === "self") return undefined;

  const targetMessages: Record<string, string> = {
    item: "Please provide an item to target.",
    player: "Please provide a player to target.",
    event: "Please provide an event to target.",
  };

  if (arguments_[0] === undefined || arguments_[0] === "")
    return [ItemCode.cannotUse, targetMessages[targetType] ?? "Please provide a target."];

  if (targetType === "item") {
    const target = getItem(arguments_[0]);
    if (target === undefined) return [ItemCode.notFound, `Item "${arguments_[0]}" not found.`];
  }

  if (targetType === "player") {
    const target = getUser(arguments_[0]);
    if (target === undefined) return [ItemCode.notFound, `Player "${arguments_[0]}" not found.`];
  }

  return undefined;
};
