import type { RouteHandler } from "@backend/types/router/route.js";
import { executeCommandRequest } from "@backend/controllers/command.controller.js";

export const POST: RouteHandler = async (request, response) => {
  await executeCommandRequest(request, response);
};
