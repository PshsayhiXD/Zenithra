import type http from "node:http";
import { WebSocketServer } from "ws";
import { createLogger } from "@utilities/logger.js";
import { REALTIME_PATH } from "@backend/utils/config.js";
import { handleRealtimeConnection } from "@backend/realtime/handlers/connection.js";

const log = createLogger("Realtime");

let websocket: WebSocketServer | undefined;

export const getWebSocketServer = (): WebSocketServer | undefined => websocket;

export const bindWebSocketServer = (server: http.Server): WebSocketServer => {
  if (websocket !== undefined) return websocket;

  websocket = new WebSocketServer({
    noServer: true,
  });

  server.on("upgrade", (request, socket, head): void => {
    const host = request.headers.host ?? "127.0.0.1";
    const url = new URL(request.url ?? "", `http://${host}`);
    const pathname = url.pathname;

    if (pathname === REALTIME_PATH || pathname === "/transport/socket") {
      websocket?.handleUpgrade(request, socket, head, (ws): void => {
        websocket?.emit("connection", ws, request);
      });
    } else socket.destroy();
  });

  websocket.on("connection", (socket, request): void => {
    handleRealtimeConnection(socket, request);
  });

  websocket.on("error", (error: Error): void => {
    log.error(error, { event: "websocketError" });
  });

  return websocket;
};
