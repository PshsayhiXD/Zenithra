import type { RouteHandler } from "@backend/types/router/route.js";
import { getRootOrRoutes } from "@backend/controllers/health.controller.js";

export const GET: RouteHandler = (request, response) => {
  void request;
  getRootOrRoutes(response);
};
