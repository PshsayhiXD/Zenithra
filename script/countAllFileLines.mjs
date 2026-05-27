import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function getFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await getFiles(full)));
    else files.push(full);
  }
  return files;
}

function chunk(files, size) {
  const out = [];
  for (let index = 0; index < files.length; index += size)
    out.push(files.slice(index, index + size));
  return out;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bases = [
  path.join(__dirname, "../src"),
  path.join(__dirname, "../drednot-client"),
  path.join(__dirname, "../script"),
];

let files = [];
for (const base of bases) files.push(...(await getFiles(base)));
const batches = chunk(files, 100);
let totalLines = 0;
for (const batch of batches) {
  const results = await Promise.all(
    batch.map(async file => {
      const content = await fs.readFile(file, "utf8");
      return content.split("\n").length;
    }),
  );
  for (const lines of results) totalLines += lines;
}
console.log(totalLines);
