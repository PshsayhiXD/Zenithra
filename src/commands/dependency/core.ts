import { getDatabase } from "@databases/index.js";
import type { Database } from "better-sqlite3";

const database: Database = getDatabase();

export { default as config } from "@configs";
export * as tables from "@tables/index.js";
export * as dbTypes from "@tables/types/index.js";
export { number, currency } from "@utilities/index.js";
export { components } from "@utilities/components/index.js";
export { database as db };

