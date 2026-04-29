import fs from "node:fs";

const rm = (target) => {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true });
};

rm("dist");
