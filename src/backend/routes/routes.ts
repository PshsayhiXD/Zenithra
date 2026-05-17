import type { RouteHandler } from "@backend/types/router/route.js";
import { getRootOrRoutes } from "@backend/controllers/health.controller.js";

export const GET: RouteHandler = (_request, response) => {
  getRootOrRoutes(response);
};
