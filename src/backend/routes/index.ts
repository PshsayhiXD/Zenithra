import type { RouteHandler } from "@backend/types/router/route.js";
import fs from "node:fs";
import path from "node:path";

export const GET: RouteHandler = (request, response) => {
  void request;
  try {
    const filePath = path.join(process.cwd(), "src/frontend/index.html");
    const htmlContent = fs.readFileSync(filePath, "utf8");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(htmlContent);
  } catch (error: unknown) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end(`Failed to load frontend: ${  error instanceof Error ? error.message : String(error)}`);
  }
};
