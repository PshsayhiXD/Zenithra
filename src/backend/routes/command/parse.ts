import type { RouteHandler } from "@backend/types/router/route.js";
import { parseCommandRequest } from "@backend/services/command.service.js";
import { sendJson } from "@backend/utils/response.js";

export const POST: RouteHandler = (_request, response, parameters) => {
  const input = parameters["input"];
  if (typeof input !== "string" || !input.trim()) {
    sendJson(response, 400, { error: "Missing input." });
    return;
  }
  const result = parseCommandRequest({
    input,
  });
  sendJson(response, result.status, {
    payload: result.payload,
    error: result.error,
  });
};
