import type { GlobalSlashCommandHashCache } from "@tables/types/globalSlashCommands/hashCache";
import type { GlobalSlashCommandId } from "@tables/types/globalSlashCommands/id";

export interface GlobalSlashCommandRow {
  id: GlobalSlashCommandId;
  hashCache: GlobalSlashCommandHashCache;
}
