import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function chunk(array, size) {
  const out = [];
  for (let index = 0; index < array.length; index += size) out.push(array.slice(index, index + size));
  return out;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirection = path.join(__dirname, "../src/databases/migrations");
const entries = await fs.readdir(migrationsDirection, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
  .map((entry) => entry.name)
  .toSorted()
  .map((name) => path.join(migrationsDirection, name));
const batches = chunk(files, 10);
for (const batch of batches) {
  const results = await Promise.all(
    batch.map(async (filePath) => {
      const content = await fs.readFile(filePath, "utf8");
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
