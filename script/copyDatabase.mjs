import fs from "node:fs";
import path from "node:path";

const rm = (target) => {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
};

const mkdir = (directory) => {
  fs.mkdirSync(directory, { recursive: true });
};

const copySqlDirectory = (sourceDirectory, destinationDirectory) => {
  mkdir(destinationDirectory);
  for (const file of fs.readdirSync(sourceDirectory)) {
    const source = path.join(sourceDirectory, file);
    const destination = path.join(destinationDirectory, file);
    const stat = fs.statSync(source);
    if (stat.isDirectory()) {
      copySqlDirectory(source, destination);
      continue;
    }
    if (!file.endsWith(".sql")) continue;
    fs.copyFileSync(source, destination);
  }
};

mkdir("dist/databases");

rm("dist/databases/migrations");

copySqlDirectory("src/databases/migrations", "dist/databases/migrations");
