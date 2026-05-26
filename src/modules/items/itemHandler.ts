import {
  type ItemContext,
  type ItemResult,
  type ItemTargetType,
  ItemCode,
} from "@modules/types/item.js";
import { getItem } from "@modules/items/_items.js";
import { getDeps } from "@commands/dependency/getDeps.js";
import {
  getUserItemSlots,
  removeItem,
  updateDurability,
  updateCharges,
} from "@tables/inventory/inventory.js";
import { hasCooldown, setCooldown } from "@tables/cooldown/cooldown.js";
import { getUser } from "@tables/user/id.js";
import { salvageItem } from "@modules/items/salvage.js";

/**
 * Validates the target argument based on the item's targetType.
 * Returns an ItemResult error if invalid, or undefined if valid.
 *
 * - "self"   no target needed, always valid
 * - "item"   args[0] must be a valid item key
 * - "player" args[0] must be a known userId
 */
const validateTarget = (
  targetType: ItemTargetType | undefined,
  arguments_: string[]
): ItemResult | undefined => {
  if (targetType === undefined || targetType === "self") return undefined;
  if (arguments_[0] === undefined || arguments_[0] === "")
    return [ItemCode.cannotUse, targetType === "item"
      ? "Please provide an item to target."
      : "Please provide a player to target."
    ];
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

/**
 * @param hashId
 * If the item has multiple slots, caller must handle ItemCode.selectSlot
 * by prompting the user to pick a slot, then re-call useItem with the chosen hashId.
 * @example
 * let result = await useItem(userId, itemId, quantity, args);
 * if (Array.isArray(result) && result[0] === ItemCode.selectSlot) {
 *   const slots = JSON.parse(result[1]) as SlotOption[];
 *   // present slots to user however you want (select menu, numbered list, etc.)
 *   // once user picks, re-call with their chosen hashId
 *   const chosenHashId = slots[0].hashId;
 *   result = await useItem(userId, itemId, quantity, args, chosenHashId);
 * }
 */
export const useItem = async (
  userId: string,
  itemId: string,
  quantity = 1,
  arguments_: string[] = [],
  hashId?: number
): Promise<ItemResult> => {
  const item = getItem(itemId);
  if (item === undefined) return [ItemCode.notFound, "Item not found."];
  if (item.usable !== true || item.use === undefined) return [ItemCode.cannotUse, "This item is not usable."];

  const slots = getUserItemSlots(userId, itemId);
  let totalQuantity = 0;
  for (const slot of slots) totalQuantity += slot.quantity;
  if (slots.length === 0 || totalQuantity < quantity) return [ItemCode.notEnough, `You don't have enough ${item.name}!`];

  if (slots.length > 1 && hashId === undefined) return [ItemCode.selectSlot, JSON.stringify(
    slots.map((slot, index) => ({
      index,
      hashId: slot.hashId,
      durability: slot.durability,
      charges: slot.charges,
      metadata: slot.metadata,
      quantity: slot.quantity,
    }))
  )];

  const inventoryItem = hashId === undefined
    ? slots[0]
    : slots.find(slot => slot.hashId === hashId);

  if (inventoryItem === undefined) return [ItemCode.notFound, "Slot not found."];

  if (item.cooldown !== undefined) {
    const namespace = `itemUse:${itemId}`;
    if (hasCooldown(userId, namespace)) return [ItemCode.cannotUse, `${item.name} is on cooldown.`];
  }

  if (item.maxDurability !== undefined) {
    const durability = inventoryItem.durability ?? item.maxDurability;
    if (durability <= 0) {
      salvageItem(userId, item);
      return [ItemCode.broken, `Your ${item.name} is broken!`];
    }
  }

  if (item.charges !== undefined) {
    const charges = inventoryItem.charges ?? item.charges;
    if (charges <= 0) return [ItemCode.broken, `Your ${item.name} has no charges left!`];
  }

  const targetError = validateTarget(item.targetType, arguments_);
  if (targetError !== undefined) return targetError;
  const isSelf = item.targetType === undefined || item.targetType === "self";
  const context: ItemContext = {
    userId,
    item,
    quantity,
    onTarget: isSelf ? [] : [arguments_[0] ?? ""],
    args: isSelf ? arguments_ : arguments_.slice(1),
    deps: getDeps(item.dependencies),
  };

  const result = await item.use(context);
  const code = Array.isArray(result) ? result[0] : result;
  if (code !== ItemCode.success) return result;

  if (item.cooldown !== undefined)
    setCooldown(userId, `itemUse:${itemId}`, item.cooldown * 1000);

  if (item.charges !== undefined) {
    const charges = (inventoryItem.charges ?? item.charges) - 1;
    if (charges <= 0) removeItem(userId, inventoryItem.hashId, 1);
    else updateCharges(userId, inventoryItem.hashId, charges);
    return result;
  }

  if (item.maxDurability !== undefined) {
    const durability = (inventoryItem.durability ?? item.maxDurability) - 1;
    if (durability <= 0) removeItem(userId, inventoryItem.hashId, 1);
    else updateDurability(userId, inventoryItem.hashId, durability);
    return result;
  }

  removeItem(userId, inventoryItem.hashId, quantity);

  return result;
};
