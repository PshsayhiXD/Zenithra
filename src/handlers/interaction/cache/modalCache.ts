import { Cache } from "@utilities/cache.js";
import type { PersistentInteractionRecord } from "@handlers/interaction/types/persistentInteraction.js";

export type ModalRecord = PersistentInteractionRecord;

export const modalCache = new Cache<ModalRecord>(
  "interaction-modal-records",
  "file",
).init();
