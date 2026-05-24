import type { RouteHandler } from "@backend/types/router/route.js";
import { serveFrontendBundledAsset } from "@backend/utils/frontend.js";

// This route serves files from the frontend bundler output directory.
// Example: GET /bundled/main.js -> src/frontend/bundled/main.js
export const GET: RouteHandler = (_request, response, parameters) => {
  const file = parameters["file"];
  if (file === undefined || file.length === 0) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Missing file name.");
    return;
  }

  serveFrontendBundledAsset(file, response);
};
