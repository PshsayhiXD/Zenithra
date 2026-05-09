import { getDatabase } from "@database/index.js";
import type { Database } from "better-sqlite3";

const database: Database = getDatabase();

export { default as config } from "@config";
export * as tables from "@tables/index.js";
export * as dbTypes from "@tables/types/index.js";
export { formatter, number, currency } from "@utilities/index.js";
export { default as createEmbed } from "@utilities/ui/embed.js";
export { database as db };

