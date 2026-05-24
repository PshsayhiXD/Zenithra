// @ts-check
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundledDir = path.join(__dirname, "bundled");
const outFile = path.join(bundledDir, "index.js");
const outCssFile = path.join(bundledDir, "index.css");
const htmlPath = path.join(__dirname, "index.html");
const templatePath = path.join(__dirname, "index.template.html");

const postcssPlugin = {
  name: "postcss-tailwind",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async args => {
      const css = await fs.promises.readFile(args.path, "utf8");
      const result = await postcss([tailwindcss()]).process(css, { from: args.path });
      return { contents: result.css, loader: "css" };
    });
  },
};

/** @type {import("esbuild").BuildOptions} */
const buildOptions = {
  entryPoints: [path.join(__dirname, "main.tsx")],
  bundle: true,
  outfile: outFile,
  format: "iife",
  globalName: "ZenithraLanding",
  minify: !process.argv.includes("--dev"),
  sourcemap: process.argv.includes("--dev"),
  target: "es2023",
  tsconfig: path.join(__dirname, "tsconfig.json"),
  logLevel: "info",
  legalComments: "none",
  jsx: "automatic",
  alias: {
    "@frontend": __dirname,
  },
  plugins: [postcssPlugin],
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
  },
};

const inlineAssetsIntoHtml = () => {
  const js = fs.readFileSync(outFile, "utf8");
  const template = fs.existsSync(templatePath)
    ? fs.readFileSync(templatePath, "utf8")
    : fs.readFileSync(htmlPath, "utf8");

  const hasMarkers =
    template.includes("<!-- ZENITHRA_STYLES -->") && template.includes("<!-- ZENITHRA_SCRIPT -->");

  if (!hasMarkers) {
    console.warn(
      "index.template.html markers missing; writing standalone bundled/index.js only. Copy script tag manually or use index.template.html.",
    );
    return;
  }

  const css = fs.existsSync(outCssFile) ? fs.readFileSync(outCssFile, "utf8") : "";
  const styleBlock = css.length > 0 ? `<style>${css}</style>` : "";
  const scriptBlock = `<script defer>${js}</script>`;

  const html = template
    .replace("<!-- ZENITHRA_STYLES -->", () => styleBlock)
    .replace("<!-- ZENITHRA_SCRIPT -->", () => scriptBlock);

  fs.writeFileSync(htmlPath, html, "utf8");
};

const writeDevHtml = () => {
  const template = fs.readFileSync(templatePath, "utf8");
  const cssLink = fs.existsSync(outCssFile)
    ? '<link rel="stylesheet" href="/bundled/index.css" />'
    : "";
  const html = template
    .replace("<!-- ZENITHRA_STYLES -->", () => cssLink)
    .replace(
      "<!-- ZENITHRA_SCRIPT -->",
      () => '<script defer src="/bundled/index.js"></script>',
    );
  fs.writeFileSync(htmlPath, html, "utf8");
};

await fs.promises.mkdir(bundledDir, { recursive: true });

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.info("Watching frontend bundle. Run with --inline after changes for backend-ready HTML.");
} else {
  await esbuild.build(buildOptions);
  if (process.argv.includes("--dev")) writeDevHtml();
  else inlineAssetsIntoHtml();
}
