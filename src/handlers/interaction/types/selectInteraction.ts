import type { SelectRecord } from "@handlers/interaction/cache/selectCache.js";

export interface AddSelectRecordOptions {
  customId: string;
  onSelect: SelectRecord["onSelect"];
  options?: SelectRecord["options"];
  /** Auto-expire the record after this many milliseconds. */
  ttlMs?: number;
}
