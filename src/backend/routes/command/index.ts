import type { RouteHandler } from "@backend/types/router/route.js";
import { listCommands } from "@backend/services/command.service.js";
import { sendJson } from "@backend/utils/response.js";

export const GET: RouteHandler = (_request, response) => {
  const commands = listCommands();
  sendJson(response, 200, commands);
};
