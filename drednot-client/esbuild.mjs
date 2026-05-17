// @ts-check
import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("esbuild").BuildOptions} */
const buildOptions = {
  entryPoints: [path.join(__dirname, "src/drednot.ts")],
  bundle: true,
  outfile: path.join(__dirname, "bundled/drednot.js"),
  format: "esm",
  minify: true,
  sourcemap: true,
  target: "es2023",
  tsconfig: path.join(__dirname, "tsconfig.json"),
  logLevel: "info",
  legalComments: "none",
};

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
} else {
  try {
    await esbuild.build(buildOptions);
  } catch {
    process.exit(1);
  }
}
