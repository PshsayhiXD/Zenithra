import type { RouteHandler } from "@backend/types/router/route.js";
import { serveFrontendPublicAsset } from "@backend/utils/frontend.js";

// This route serves files from src/frontend/public.
// Example: GET /public/zenithra.png -> src/frontend/public/zenithra.png
export const GET: RouteHandler = (_request, response, parameters) => {
  const file = parameters["file"];
  if (file === undefined || file.length === 0) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Missing file name.");
    return;
  }

  serveFrontendPublicAsset(file, response);
};
