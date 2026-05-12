import type { ButtonRecord } from "@handlers/interaction/cache/buttonCache.js";

export interface AddButtonRecordOptions {
  customId: string;
  onClick: ButtonRecord["onClick"];
  options?: ButtonRecord["options"];
  /** Auto-expire the record after this many milliseconds. */
  ttlMs?: number;
}
