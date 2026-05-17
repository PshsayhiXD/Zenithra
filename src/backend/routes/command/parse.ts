import type { RouteHandler } from "@backend/types/router/route.js";
import { parseCommandRequest } from "@backend/controllers/command.controller.js";

export const POST: RouteHandler = async (request, response) => {
  await parseCommandRequest(request, response);
};
