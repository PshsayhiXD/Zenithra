import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "node:path";

const isDevelopment = process.env["NODE_ENV"] === "development";
const databaseFileName = isDevelopment ? "bot.local.db" : "bot.db";
const databasePath = path.join(__dirname, "../../data", databaseFileName);

const database = new Database(databasePath);

database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

const getDatabaseInternal = (): DatabaseType => database;

export const getDatabase: () => DatabaseType = getDatabaseInternal;
