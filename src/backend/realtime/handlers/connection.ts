import type http from "node:http";
import type { WebSocket } from "ws";
import { createLogger } from "@utilities/logger.js";
import { disconnectClientSession } from "@backend/services/client.service.js";
import { getRealtimeBroker } from "@backend/realtime/broker.js";
import { handleRealtimeMessage } from "@backend/realtime/handlers/message.js";

const log = createLogger("RealtimeConnection");

export const handleRealtimeConnection = (socket: WebSocket, request: http.IncomingMessage): void => {
  const broker = getRealtimeBroker();
  const connection = broker.addConnection(socket, request.socket.remoteAddress ?? "unknown");

  log.info(`Realtime client connected: ${connection.remoteAddress} (${connection.sessionId})`);

  broker.send(socket, {
    type: "system.connected",
    payload: {
      clientId: null,
      sessionId: connection.sessionId,
      state: "connected"
    }
  });

  socket.on("message", (data): void => {
    handleRealtimeMessage(socket, data);
  });

  socket.on("close", (): void => {
    const closedConnection = broker.removeConnection(socket);
    if (closedConnection?.clientId !== null && closedConnection?.clientId !== undefined) {
      disconnectClientSession(closedConnection.clientId, closedConnection.sessionId);
    }

    broker.broadcast({
      type: "client.lifecycle",
      payload: {
        clientId: closedConnection?.clientId ?? null,
        sessionId: closedConnection?.sessionId ?? connection.sessionId,
        state: "disconnected"
      }
    });

    log.info(`Realtime client disconnected: ${connection.sessionId}`);
  });

  socket.on("error", (error: Error): void => {
    log.error(error, { event: "socketError", sessionId: connection.sessionId });
  });
};
