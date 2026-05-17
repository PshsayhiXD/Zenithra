import { randomUUID } from "node:crypto";
import { WebSocket } from "ws";
import type { RealtimeEnvelope } from "@backend/realtime/events/schema.js";

export interface RealtimeConnection {
  sessionId: string;
  clientId: string | null;
  connectedAt: number;
  remoteAddress: string;
  socket: WebSocket;
}

class RealtimeBroker {
  private readonly connections = new Map<WebSocket, RealtimeConnection>();
  private readonly clientConnections = new Map<string, Set<WebSocket>>();

  addConnection(socket: WebSocket, remoteAddress: string): RealtimeConnection {
    const connection: RealtimeConnection = {
      sessionId: randomUUID(),
      clientId: null,
      connectedAt: Date.now(),
      remoteAddress,
      socket
    };

    this.connections.set(socket, connection);
    return connection;
  }

  getConnection(socket: WebSocket): RealtimeConnection | undefined {
    return this.connections.get(socket);
  }

  bindClient(socket: WebSocket, clientId: string): RealtimeConnection | undefined {
    const connection = this.connections.get(socket);
    if (connection === undefined) return undefined;

    const previousClientId = connection.clientId;
    if (previousClientId !== null && previousClientId !== clientId) {
      const previousConnections = this.clientConnections.get(previousClientId);
      previousConnections?.delete(socket);
      if (previousConnections?.size === 0) this.clientConnections.delete(previousClientId);
    }

    connection.clientId = clientId;

    let sockets = this.clientConnections.get(clientId);
    if (sockets === undefined) {
      sockets = new Set<WebSocket>();
      this.clientConnections.set(clientId, sockets);
    }
    sockets.add(socket);

    return connection;
  }

  removeConnection(socket: WebSocket): RealtimeConnection | undefined {
    const connection = this.connections.get(socket);
    if (connection === undefined) return undefined;

    this.connections.delete(socket);

    if (connection.clientId !== null) {
      const sockets = this.clientConnections.get(connection.clientId);
      sockets?.delete(socket);
      if (sockets?.size === 0) this.clientConnections.delete(connection.clientId);
    }

    return connection;
  }

  send(socket: WebSocket, message: RealtimeEnvelope): void {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
  }

  sendToClient(clientId: string, message: RealtimeEnvelope): void {
    const sockets = this.clientConnections.get(clientId);
    if (sockets === undefined) return;

    for (const socket of sockets) this.send(socket, message);
  }

  broadcast(message: RealtimeEnvelope, options?: { excludeSessionId?: string }): void {
    for (const connection of this.connections.values()) {
      if (connection.socket.readyState !== WebSocket.OPEN) continue;
      if (options?.excludeSessionId === connection.sessionId) continue;
      connection.socket.send(JSON.stringify(message));
    }
  }
}

let broker: RealtimeBroker | undefined;

export const getRealtimeBroker = (): RealtimeBroker => {
  broker ??= new RealtimeBroker();
  return broker;
};
