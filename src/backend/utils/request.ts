import type { IncomingMessage } from "node:http";

export const getClientIp = (
  request: IncomingMessage,
): string => {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.socket.remoteAddress ?? "unknown";
};
