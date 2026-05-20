import type { RouteHandler } from "@backend/types/router/route.js";
import { identityRequest } from "@backend/controllers/chat.controller.js";

export const POST: RouteHandler = (request, response) => {
  void identityRequest(request, response);
};

export const GET: RouteHandler = (request, response) => {
  void identityRequest(request, response);
};
