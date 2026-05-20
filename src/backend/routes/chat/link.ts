import type { RouteHandler } from "@backend/types/router/route.js";
import { linkRequest, linkOAuthRequest } from "@backend/controllers/chat.controller.js";

export const POST: RouteHandler = (request, response) => {
  void linkRequest(request, response);
};

export const GET: RouteHandler = (request, response) => {
  void linkOAuthRequest(request, response);
};
