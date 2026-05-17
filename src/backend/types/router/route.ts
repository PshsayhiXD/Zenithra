import type { IncomingMessage, ServerResponse } from "node:http";

export type RouteHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  parameters: Record<string, string>
) => void | Promise<void>;

export interface RouteModule {
  GET?: RouteHandler;
  POST?: RouteHandler;
  PUT?: RouteHandler;
  DELETE?: RouteHandler;
  OPTIONS?: RouteHandler;
  PATCH?: RouteHandler;
}
