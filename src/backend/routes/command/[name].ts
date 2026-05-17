import type { RouteHandler } from "@backend/types/router/route.js";
import { getCommandByName } from "@backend/controllers/command.controller.js";
import { sendJson } from "@backend/utils/http.js";

export const GET: RouteHandler = (_request, response, parameters) => {
  const name = parameters["name"];
  if (name === undefined || name.length === 0) {
    sendJson(response, 400, { error: "Missing command name." });
    return;
  }

  if (name === "parse" || name === "execute") {
    sendJson(response, 404, { error: "Route not found." });
    return;
  }

  getCommandByName(name, response);
};
