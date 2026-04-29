import { getDatabase } from "@database/index.js";
import type {
    GlobalSlashCommandHashCache,
    GlobalSlashCommandRow,
} from "@database/tables/types/globalSlashCommands";
import {
    deleteGlobalSlashCommandStmt,
    getGlobalSlashCommandStmt,
    setGlobalSlashCommandStmt,
} from "@tables/globalSlashCommands/_statements.js";

const database = getDatabase();

const replaceGlobalSlashCommandTx = database.transaction(
  (hashCache: GlobalSlashCommandHashCache): void => {
    deleteGlobalSlashCommandStmt.run();
    setGlobalSlashCommandStmt.run(hashCache);
  },
);

export const getGlobalSlashCommand = (): GlobalSlashCommandRow | undefined => getGlobalSlashCommandStmt.get() ?? undefined;

export const setGlobalSlashCommand = (hashCache: GlobalSlashCommandHashCache): void => {
  replaceGlobalSlashCommandTx(hashCache);
};
