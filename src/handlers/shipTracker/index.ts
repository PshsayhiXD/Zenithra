import {
  getPublicPersistentShips,
  getPublicEphemeralShips,
} from "@handlers/shipTracker/shipTracker.js";
import { drawShipWallPng, mergeShipLists } from "@handlers/shipTracker/draw.js";

export type { ShipFromLink } from "@handlers/shipTracker/type.js";

export const buildPublicPersistentShips = async (): Promise<Buffer> => {
  const data = await getPublicPersistentShips();
  const png = await drawShipWallPng(data, "Persistent Ships", "Updates every 30s");
  return png;
};

export const buildPublicEphemeralShips = async (): Promise<Buffer> => {
  const data = await getPublicEphemeralShips();
  const png = await drawShipWallPng(data, "Ephemeral Ships", "Updates every 30s.");
  return png;
};

export const buildPublicCombinedShips = async (): Promise<Buffer> => {
  const persisted = await getPublicPersistentShips();
  const ephemeral = await getPublicEphemeralShips();
  const merged = mergeShipLists(persisted, ephemeral);
  const png = await drawShipWallPng(merged, "Combined Ships", "Updates every 30s.");
  return png;
};

export {getShipFromLink, getPublicPersistentShips, getPublicEphemeralShips} from "./shipTracker.js";
export {drawShipWallSvg, drawShipWallPng, mergeShipLists} from "./draw.js";
export {type PublicShip, type PublicShipList, type PublicPersistentShips, type PublicEphemeralShips} from "./type.js";