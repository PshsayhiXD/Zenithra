import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "../src/database/migrations");
const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
const files = entries
  .filter((e) => e.isFile() && e.name.endsWith(".sql"))
  .map((e) => e.name)
  .sort()
  .map((name) => path.join(migrationsDir, name));
const batches = chunk(files, 10);
for (const batch of batches) {
  const results = await Promise.all(
    batch.map(async (filePath) => {
      const content = await fs.readFile(filePath, "utf-8");
      const cleaned = content
        .split("\n")
        .filter((line) => line.trim() !== "")
        .join("\n");
      return { filePath, cleaned };
    }),
  );

  for (const { filePath, cleaned } of results) {
    const file = path.basename(filePath);
    console.log("\n" + file + "\n" + cleaned);
  }
}
