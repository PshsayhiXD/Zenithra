import { deleteGlobalSlashCommandStmt } from "@tables/globalSlashCommands/_statements";

export const deleteGlobalSlashCommand = (): void => {
  deleteGlobalSlashCommandStmt.run();
};
