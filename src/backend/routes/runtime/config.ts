import type { RouteHandler } from "@backend/types/router/route.js";
import { sendJson } from "@backend/utils/response.js";
import { resolvePublicBaseUrl, REALTIME_PATH } from "@backend/utils/config.js";

export const GET: RouteHandler = (request, response) => {
  const publicBaseUrl = resolvePublicBaseUrl(request);
  sendJson(response, 200, {
    backendUrl: publicBaseUrl,
    realtimePath: REALTIME_PATH,
  });
};
