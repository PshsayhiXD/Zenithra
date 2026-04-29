import type { GlobalSlashCommandHashCache } from "@tables/types/globalSlashCommands/hashCache.js";
import type { GlobalSlashCommandId } from "@tables/types/globalSlashCommands/id.js";

export interface GlobalSlashCommandRow {
  id: GlobalSlashCommandId;
  hashCache: GlobalSlashCommandHashCache;
}
