import { getDatabase } from "@database/index";
import fs from "node:fs";
import path from "node:path";
const database = getDatabase();

const migrationsDirectory = path.join(__dirname, "migrations");

database.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY,
    runAt INTEGER NOT NULL
  )
`);

const getRanMigrationsStmt = database.prepare<[], { id: string }>(
  "SELECT id FROM migrations ORDER BY id ASC",
);

const insertMigrationStmt = database.prepare<[string, number]>(
  "INSERT OR IGNORE INTO migrations (id, runAt) VALUES (?, ?)",
);

export const getMigrationFiles = (): string[] => {
  if (!fs.existsSync(migrationsDirectory)) return [];
  const files = fs.readdirSync(migrationsDirectory);
  return files
    .filter((f) => f.endsWith(".sql"))
    .slice()
    .sort((a, b) => {
      const ai = Number(a.match(/^\d+/)?.[0] ?? 0);
      const bi = Number(b.match(/^\d+/)?.[0] ?? 0);
      return ai - bi;
    });
};

export const markAllMigrationsAsApplied = (): string[] => {
  const files = getMigrationFiles();
  const now = Date.now();
  for (const file of files) {
    insertMigrationStmt.run(file, now);
  }
  return files;
};

export const runPendingMigrations = (): string[] => {
  const ran = new Set(getRanMigrationsStmt.all().map((m: { id: string }): string => m.id));
  const files = getMigrationFiles();
  const executed: string[] = [];
  const tx = database.transaction((): void => {
    for (const file of files) {
      if (ran.has(file)) continue;
      const fullPath = path.join(migrationsDirectory, file);
      const sql = fs.readFileSync(fullPath, "utf8");
      database.exec(sql);
      insertMigrationStmt.run(file, Date.now());
      executed.push(file);
    }
  });
  tx();
  return executed;
};