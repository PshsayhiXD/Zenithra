import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { sendJson } from "@backend/utils/response.js";
import { applyCors } from "@backend/middleware/cors.js";
import { loadRoutes, matchAndHandleRoute } from "@backend/utils/router.js";
import { BACKEND_HOST, BACKEND_PORT } from "@backend/utils/config.js";
import { readFrontendIndexHtml } from "@backend/utils/frontend.js";

let routesLoaded = false;
export const ensureRoutesLoaded = async (): Promise<void> => {
  if (!routesLoaded) {
    routesLoaded = true;
    await loadRoutes(path.join(__dirname, "routes"));
  }
};

export const handleRequest = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  await ensureRoutesLoaded();

  const method = request.method ?? "GET";
  const host = request.headers.host ?? `${BACKEND_HOST}:${String(BACKEND_PORT)}`;
  const url = new URL(request.url ?? "/", `http://${host}`);

  applyCors(response);

  if (method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const handled = await matchAndHandleRoute(request, response, url.pathname);
  if (handled) return;

  // If the request is for a public static file under /public/, do not fall back to index.html.
  // That makes the backend behavior clear for beginner users: /public/* is static asset serving,
  // while all other unmatched paths are treated as SPA routes and return index.html.
  if (url.pathname.startsWith("/public/")) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Public asset not found.");
    return;
  }

  // Serve frontend HTML for unmatched routes (SPA fallback)
  try {
    const htmlContent = readFrontendIndexHtml();
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(htmlContent);
  } catch {
    sendJson(response, 404, { error: "Route not found." });
  }
};
