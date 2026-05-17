import type { RouteHandler } from "@backend/types/router/route.js";
import { getHealth } from "@backend/controllers/health.controller.js";

export const GET: RouteHandler = (request, response) => {
  void request;
  getHealth(response);
};
