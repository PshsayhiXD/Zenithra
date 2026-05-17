import type { RouteHandler } from "@backend/types/router/route.js";
import { getCommands } from "@backend/controllers/command.controller.js";

export const GET: RouteHandler = (_request, response) => {
  getCommands(response);
};
