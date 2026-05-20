import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await getFiles(full));
    else files.push(full);
  }
  return files;
}

function chunk(files, size) {
  const out = [];
  for (let i = 0; i < files.length; i += size)
    out.push(files.slice(i, i + size));
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
for (const base of bases)
  files = files.concat(await getFiles(base));
const batches = chunk(files, 100);
let totalLines = 0;
for (const batch of batches) {
  const results = await Promise.all(
    batch.map(async (file) => {
      const content = await fs.readFile(file, "utf-8");
      return content.split("\n").length;
    }),
  );
  for (const lines of results) totalLines += lines;
}
console.log(totalLines);
