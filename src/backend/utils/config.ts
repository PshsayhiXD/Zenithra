import type { IncomingMessage } from "node:http";

export const BACKEND_HOST = "0.0.0.0";
export const BACKEND_PORT = 8787;
export const BACKEND_URL = `https://localhost:${String(BACKEND_PORT)}`
export const REALTIME_PATH = "/realtime";
export const FILEPATH = {
  certificate: [
    // starts from root (/zenithra/)
    // key, cert
    "./cert/localhost.pem",
    "./cert/localhost-key.pem"
  ] as [string, string],
  frontend: {
    directory: "src/frontend",
    indexHtml: "src/frontend/index.html",
    bundledDirectory: "src/frontend/bundled",
    publicDirectory: "src/frontend/public",
  },
} as const;
const getForwardedValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) return value[0];
  if (typeof value !== "string") return undefined;
  const [firstValue] = value.split(",");
  return firstValue?.trim();
};

export const resolvePublicBaseUrl = (request: IncomingMessage): string => {
  const forwardedProtocol = getForwardedValue(request.headers["x-forwarded-proto"]);
  const forwardedHost = getForwardedValue(request.headers["x-forwarded-host"]);
  const protocol = forwardedProtocol ?? "https";
  const host =
    forwardedHost ??
    request.headers.host ??
    `localhost:${String(BACKEND_PORT)}`;

  return `${protocol}://${host}`;
};

export const toWebSocketBaseUrl = (httpUrl: string): string =>
  httpUrl
    .replace(/^http:\/\//u, "ws://")
    .replace(/^https:\/\//u, "wss://");
