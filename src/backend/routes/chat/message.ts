import type { RouteHandler } from "@backend/types/router/route.js";
import { chatMessageRequest } from "@backend/controllers/chat.controller.js";

export const POST: RouteHandler = (request, response) => {
  void chatMessageRequest(request, response);
};
