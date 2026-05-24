import type { RouteHandler } from "@backend/types/router/route.js";
import { sendJson } from "@backend/utils/response.js";

export const GET: RouteHandler = (request, response) => {
  void request;
  sendJson(response, 426, {
    error: "Upgrade Required",
    message: "This is a WebSocket transport endpoint. Please upgrade to a WebSocket connection.",
  });
};
