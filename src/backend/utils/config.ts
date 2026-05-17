import type { IncomingMessage } from "node:http";

export const BACKEND_HOST = "127.0.0.1";
export const BACKEND_PORT = 8787;
export const REALTIME_PATH = "/realtime";

const getForwardedValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  if (typeof value !== "string") return undefined;

  const [firstValue] = value.split(",");
  return firstValue?.trim();
};

export const resolvePublicBaseUrl = (request: IncomingMessage): string => {
  const forwardedProtocol = getForwardedValue(request.headers["x-forwarded-proto"]);
  const forwardedHost = getForwardedValue(request.headers["x-forwarded-host"]);
  const host = forwardedHost ?? request.headers.host ?? `${BACKEND_HOST}:${String(BACKEND_PORT)}`;
  const protocol = forwardedProtocol ?? "http";

  return `${protocol}://${host}`;
};

export const toWebSocketBaseUrl = (httpUrl: string): string =>
  httpUrl.replace(/^http:\/\//u, "ws://").replace(/^https:\/\//u, "wss://");
