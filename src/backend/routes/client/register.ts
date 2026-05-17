import type { RouteHandler } from "@backend/types/router/route.js";
import { registerClientRequest } from "@backend/controllers/client.controller.js";

export const POST: RouteHandler = (request, response) => registerClientRequest(request, response);
