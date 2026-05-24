import type { RouteHandler } from "@backend/types/router/route.js";
import { executeCommandRequest } from "@backend/services/command.service.js";

export const POST: RouteHandler = async (request, response) => {
  await executeCommandRequest(request, response);
};
