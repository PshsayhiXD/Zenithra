import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { sendJson } from "@backend/utils/http.js";
import { applyCors } from "@backend/middleware/cors.js";
import { loadRoutes, matchAndHandleRoute } from "@backend/utils/router.js";

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
  const host = request.headers.host ?? "127.0.0.1:8787";
  const url = new URL(request.url ?? "/", `http://${host}`);

  applyCors(response);

  if (method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const handled = await matchAndHandleRoute(request, response, url.pathname);
  if (handled) return;

  sendJson(response, 404, { error: "Route not found." });
};
