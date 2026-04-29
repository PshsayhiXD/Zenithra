import { deleteGlobalSlashCommandStmt } from "@tables/globalSlashCommands/_statements.js";

export const deleteGlobalSlashCommand = (): void => {
  deleteGlobalSlashCommandStmt.run();
};
