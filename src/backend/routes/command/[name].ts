import type { RouteHandler } from "@backend/types/router/route.js";
import { getCommand } from "@backend/services/command.service.js";
import { sendJson } from "@backend/utils/response.js";

export const GET: RouteHandler = (_request, response, parameters) => {
  const name = parameters["name"];
  if (name === undefined) {
    sendJson(response, 400, { error: "Missing command name." });
    return;
  }
  if (name === "parse" || name === "execute") {
    sendJson(response, 404, { error: "Route not found." });
    return;
  }
  const cmd = getCommand(name);
  if (!cmd) {
    sendJson(response, 404, { error: "Command not found." });
    return;
  }
  sendJson(response, 200, cmd);
};
