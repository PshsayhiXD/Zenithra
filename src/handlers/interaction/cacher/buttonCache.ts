import { Cache } from "@utilities/cache.js";
import type { PersistentInteractionRecord } from "@handlers/interaction/types/persistentInteraction.js";

export type ButtonRecord = PersistentInteractionRecord;

export const buttonCache = new Cache<ButtonRecord>(
  "interaction-button-records",
  "file",
).init();
