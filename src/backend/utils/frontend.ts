import fs from "node:fs";
import path from "node:path";
import type { ServerResponse } from "node:http";
import { FILEPATH } from "@backend/utils/config.js";
import environment from "../../environment.js";

const ALLOWED_BUNDLED_EXTENSIONS = new Set([".js", ".map", ".css"]);

const contentTypeByExtension: Record<string, string> = {
  ".js": "application/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
};

const resolveFromCwd = (relativePath: string): string =>
  path.resolve(process.cwd(), relativePath);

export const readFrontendIndexHtml = (): string => {
  const filePath = resolveFromCwd(FILEPATH.frontend.indexHtml);
  let htmlContent = fs.readFileSync(filePath, "utf8");

  const environmentConfig = {
    OPT_DISCORD_BOT_INVITE_URL: (environment["OPT_DISCORD_BOT_INVITE_URL"] as string) || "",
    OPT_OAUTH_REDIRECT_URL: (environment["OPT_OAUTH_REDIRECT_URL"] as string) || "",
  };

  const environmentScript = `<script>window.__ZENITHRA_ENV__ = ${JSON.stringify(environmentConfig)};</script>`;
  htmlContent = htmlContent.replace("</head>", `${environmentScript}</head>`);

  return htmlContent;
};

export const serveFrontendBundledAsset = (
  fileName: string,
  response: ServerResponse,
): boolean => {
  const extension = path.extname(fileName);
  if (!ALLOWED_BUNDLED_EXTENSIONS.has(extension)) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found.");
    return true;
  }

  const bundledRoot = resolveFromCwd(FILEPATH.frontend.bundledDirectory);
  const assetPath = path.resolve(bundledRoot, fileName);
  const relative = path.relative(bundledRoot, assetPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    response.writeHead(403, { "Content-Type": "text/plain" });
    response.end("Forbidden.");
    return true;
  }

  if (!fs.existsSync(assetPath)) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found.");
    return true;
  }

  const contentType = contentTypeByExtension[extension] ?? "application/octet-stream";
  const body = fs.readFileSync(assetPath);
  response.writeHead(200, { "Content-Type": contentType });
  response.end(body);
  return true;
};

export const serveFrontendPublicAsset = (
  fileName: string,
  response: ServerResponse,
): boolean => {
  // Only serve files from the public frontend folder.
  // Do not allow requests to escape this directory.
  const sanitizedFileName = fileName.replace(/^\/+/, "");
  const extension = path.extname(sanitizedFileName).toLowerCase();
  if (contentTypeByExtension[extension] === undefined) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found.");
    return true;
  }

  const publicRoot = resolveFromCwd(FILEPATH.frontend.publicDirectory);
  const assetPath = path.resolve(publicRoot, sanitizedFileName);
  const relative = path.relative(publicRoot, assetPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    response.writeHead(403, { "Content-Type": "text/plain" });
    response.end("Forbidden.");
    return true;
  }

  if (!fs.existsSync(assetPath)) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found.");
    return true;
  }

  const contentType = contentTypeByExtension[extension] ?? "application/octet-stream";
  const body = fs.readFileSync(assetPath);
  response.writeHead(200, { "Content-Type": contentType });
  response.end(body);
  return true;
};
