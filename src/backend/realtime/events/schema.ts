import type { CommandDispatchRequest } from "@backend/domain/command/types.js";

export interface RealtimeEnvelope<TPayload = unknown> {
  type: string;
  payload: TPayload;
  id?: string;
}

export interface ClientRegisterPayload {
  clientId: string;
}

export interface HeartbeatPayload {
  timestamp: number;
}

export interface LifecyclePayload {
  clientId: string | null;
  sessionId: string;
  state: "connected" | "registered" | "disconnected";
}

export interface PublishEventPayload {
  eventType: string;
  payload: unknown;
  targetClientId?: string;
  room?: string;
}

export type RealtimeIncomingMessage =
  | RealtimeEnvelope<ClientRegisterPayload>
  | RealtimeEnvelope<HeartbeatPayload>
  | RealtimeEnvelope<PublishEventPayload>
  | RealtimeEnvelope<CommandDispatchRequest>;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isRealtimeEnvelope = (value: unknown): value is RealtimeEnvelope => {
  if (!isObjectRecord(value)) return false;
  return typeof value["type"] === "string" && "payload" in value;
};
