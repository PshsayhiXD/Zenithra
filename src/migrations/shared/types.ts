import type { Client } from "discord.js";

export interface MigrationDefinition {
  id: string;
  registerHandlers: () => void;
  run: (client: Client) => Promise<boolean>;
}
