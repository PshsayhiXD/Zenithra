import type { RawData, WebSocket } from "ws";
import { createLogger } from "@utilities/logger.js";
import { isRealtimeEnvelope, type ClientRegisterPayload, type PublishEventPayload, type RealtimeEnvelope } from "@backend/realtime/events/schema.js";
import { connectClientSession } from "@backend/services/client.service.js";
import { getRealtimeBroker } from "@backend/realtime/broker.js";

const logger = createLogger("RealtimeMessage");

const decodeRealtimeMessage = (data: RawData): string => {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (Array.isArray(data)) return Buffer.concat(data as Buffer[]).toString("utf8");
  return Buffer.from(data).toString("utf8");
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

interface ClientRegisterRecord {
  clientId?: unknown;
}

interface PublishEventRecord {
  eventType?: unknown;
  payload?: unknown;
  targetClientId?: unknown;
  room?: unknown;
}

const withOptionalId = <TPayload>(message: RealtimeEnvelope<TPayload>, id: string | undefined): RealtimeEnvelope<TPayload> =>
  id === undefined
    ? message
    : {
        ...message,
        id
      };

const sendError = (socket: WebSocket, message: string, id?: string): void => {
  getRealtimeBroker().send(socket, withOptionalId({
    type: "error",
    payload: { message }
  }, id));
};

const bindRegisteredClient = (socket: WebSocket, payload: ClientRegisterPayload, id?: string): void => {
  const broker = getRealtimeBroker();
  const connection = broker.getConnection(socket);

  if (connection === undefined) {
    sendError(socket, "Realtime session not found.", id);
    return;
  }

  const registeredClient = connectClientSession(payload.clientId, connection.sessionId);
  if (registeredClient === undefined) {
    sendError(socket, `Unknown clientId: ${payload.clientId}`, id);
    return;
  }

  broker.bindClient(socket, registeredClient.clientId);
  broker.send(socket, withOptionalId({
    type: "client.registered",
    payload: {
      clientId: registeredClient.clientId,
      sessionId: connection.sessionId,
      state: "registered"
    }
  }, id));

  broker.broadcast({
    type: "client.lifecycle",
    payload: {
      clientId: registeredClient.clientId,
      sessionId: connection.sessionId,
      state: "registered"
    }
  }, {
    excludeSessionId: connection.sessionId
  });
};

const publishEvent = (socket: WebSocket, message: RealtimeEnvelope<PublishEventPayload>): void => {
  const broker = getRealtimeBroker();
  const connection = broker.getConnection(socket);

  if (connection?.clientId === null || connection?.clientId === undefined) {
    sendError(socket, "Register the client over HTTP and WebSocket before publishing events.", message.id);
    return;
  }

  if (typeof message.payload.eventType !== "string" || message.payload.eventType.length === 0) {
    sendError(socket, "Missing payload.eventType.", message.id);
    return;
  }

  const forwardedMessage: RealtimeEnvelope = {
    type: message.payload.eventType,
    payload: {
      clientId: connection.clientId,
      room: message.payload.room ?? null,
      data: message.payload.payload
    }
  };

  if (typeof message.payload.targetClientId === "string" && message.payload.targetClientId.length > 0) {
    broker.sendToClient(message.payload.targetClientId, withOptionalId(forwardedMessage, message.id));
    return;
  }

  broker.broadcast(withOptionalId(forwardedMessage, message.id), {
    excludeSessionId: connection.sessionId
  });
};

export const handleRealtimeMessage = (socket: WebSocket, data: RawData): void => {
  try {
    const rawMessage = decodeRealtimeMessage(data);
    const parsed: unknown = JSON.parse(rawMessage);

    if (!isRealtimeEnvelope(parsed)) {
      sendError(socket, "Expected a realtime envelope with type and payload.");
      return;
    }

    switch (parsed.type) {
      case "client.register": {
        const payload = parsed.payload as ClientRegisterRecord;

        if (
          !isObjectRecord(parsed.payload) ||
          typeof payload.clientId !== "string"
        ) {
          sendError(socket, "Missing payload.clientId.", parsed.id);
          return;
        }

        bindRegisteredClient(socket, {
          clientId: payload.clientId
        }, parsed.id);
        return;
      }

      case "heartbeat.ping": {
        getRealtimeBroker().send(socket, withOptionalId({
          type: "heartbeat.pong",
          payload: {
            timestamp: Date.now()
          }
        }, parsed.id));
        return;
      }

      case "event.publish": {
        if (!isObjectRecord(parsed.payload)) {
          sendError(socket, "Expected an event payload object.", parsed.id);
          return;
        }

        const payload = parsed.payload as PublishEventRecord;
        const targetClientId =
          typeof payload.targetClientId === "string" ? payload.targetClientId : undefined;
        const room = typeof payload.room === "string" ? payload.room : undefined;

        publishEvent(socket, {
          type: parsed.type,
          payload: {
            eventType: typeof payload.eventType === "string" ? payload.eventType : "",
            payload: payload.payload,
            ...(targetClientId === undefined ? {} : { targetClientId }),
            ...(room === undefined ? {} : { room })
          },
          ...(parsed.id === undefined ? {} : { id: parsed.id })
        });
        return;
      }

      default: {
        sendError(socket, `Unsupported realtime message type: ${parsed.type}`, parsed.id);
      }
    }
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    logger.error(error_, { event: "messageError" });
    sendError(socket, error_.message);
  }
};
