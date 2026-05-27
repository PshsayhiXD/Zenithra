import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

// !! REQUIRE to build first, then run this file.
const ITEMS_DIR = path.resolve("dist/modules/items");
const OUTPUT = path.resolve("src/modules/items/_ids.ts");

const getDefaultExport = (module_) => {
  if (module_ === null || typeof module_ !== "object") return module_;
  if (module_.default !== undefined && module_.default !== null && typeof module_.default === "object") {
    return module_.default.default ?? module_.default;
  }
  return module_.default ?? module_;
};

const collectItems = async (directory) => {
  const results = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name === "index.js") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectItems(fullPath));
      continue;
    }
    if (!entry.name.endsWith(".js")) continue;
    try {
      const module_ = await import(pathToFileURL(fullPath).href);
      const resolved = getDefaultExport(module_);
      if (resolved !== null && typeof resolved === "object") {
        const item = resolved;
        if (typeof item.id === "number" && item.id !== 0 && typeof item.name === "string") {
          const key = item.name.toLowerCase().replaceAll(" ", "_");
          results.push({ key, id: item.id });
        }
      }
    } catch {
      // skip files that fail to import
    }
  }
  return results;
};

const generate = async () => {
  const collected = await collectItems(ITEMS_DIR);
  collected.sort((a, b) => a.id - b.id);

  const lines = [
    "// AUTO-GENERATED !! do not edit manually. Run `npm run build:itemIds` to update.",
    "",
    "export const ItemId = {",
    ...collected.map(({ key, id }) => `  ${key}: ${id},`),
    "} as const;",
    "",
    "export type ItemIdKey = keyof typeof ItemId;",
    "export type ItemIdValue = typeof ItemId[ItemIdKey];",
    "",
  ];

  await fs.writeFile(OUTPUT, lines.join("\n"), "utf8");
  console.log(`Generated ${collected.length} item IDs → ${OUTPUT}`);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
generate().catch(console.error);
