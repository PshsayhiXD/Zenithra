import fs from "node:fs";
import path from "node:path";

(() => {
  const rootDir = process.cwd();
  const examplePath = path.join(rootDir, ".env.example");
  const envPath = path.join(rootDir, ".env");
  const content = fs.readFileSync(examplePath, "utf8");
  const output = content
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith("#"))
    .map(line => {
      const [left, ...rest] = line.split("=");
      if (!left) return "";
      const [key] = left.split(":");
      if (!key) return "";
      const value = rest.join("=");
      return `${key}=${value ?? ""}`;
    })
    .filter(Boolean)
    .join("\n");

  fs.writeFileSync(envPath, output + "\n", "utf8");
  console.log(".env.example -> .env successfully");
})();
