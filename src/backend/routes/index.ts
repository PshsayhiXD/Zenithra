import type { RouteHandler } from "@backend/types/router/route.js";
import { readFrontendIndexHtml } from "@backend/utils/frontend.js";

export const GET: RouteHandler = (request, response) => {
  void request;
  try {
    const htmlContent = readFrontendIndexHtml();
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(htmlContent);
  } catch (error: unknown) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end(`Failed to load frontend: ${  error instanceof Error ? error.message : String(error)}`);
  }
};
