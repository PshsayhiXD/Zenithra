import fs from "node:fs";
import path from "node:path";

const rm = (target) => {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
};

const mkdir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const copySqlDir = (srcDir, destDir) => {
  mkdir(destDir);
  for (const file of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      copySqlDir(src, dest);
      continue;
    }
    if (!file.endsWith(".sql")) continue;
    fs.copyFileSync(src, dest);
  }
};

mkdir("dist/database");

rm("dist/database/migrations");

copySqlDir("src/database/migrations", "dist/database/migrations");