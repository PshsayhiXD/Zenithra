import { Cache } from "@utilities/cache.js";
import type { PersistentInteractionRecord } from "@handlers/interaction/types/persistentInteraction.js";

export type SelectRecord = PersistentInteractionRecord;

export const selectCache = new Cache<SelectRecord>(
  "interaction-select-records",
  "file",
).init();
