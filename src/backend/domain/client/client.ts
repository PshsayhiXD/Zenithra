import { randomUUID } from "node:crypto";
import type {
  ClientRecord,
  ClientRegistrationInput,
  ClientRegistrationResult
} from "@backend/domain/client/types.js";

const updateClient = (
  client: ClientRecord,
  now: number,
  patch: Partial<Omit<ClientRecord, "clientId" | "createdAt">>
): ClientRecord => ({
  ...client,
  ...patch,
  updatedAt: now
});

export const createClientRegistration = (
  input: ClientRegistrationInput,
  existingClient: ClientRecord | undefined,
  now = Date.now()
): ClientRegistrationResult => {
  if (existingClient !== undefined) {
    return {
      client: updateClient(existingClient, now, {
        connected: false,
        lastSeenAt: now,
        sessionId: null,
        userAgent: input.userAgent ?? existingClient.userAgent
      }),
      created: false
    };
  }

  return {
    client: {
      clientId: input.existingClientId ?? randomUUID(),
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
      connected: false,
      sessionId: null,
      userAgent: input.userAgent ?? null
    },
    created: true
  };
};

export const markClientConnected = (
  client: ClientRecord,
  sessionId: string,
  now = Date.now()
): ClientRecord =>
  updateClient(client, now, {
    connected: true,
    lastSeenAt: now,
    sessionId
  });

export const markClientDisconnected = (
  client: ClientRecord,
  sessionId: string,
  now = Date.now()
): ClientRecord =>
  updateClient(client, now, {
    connected: client.sessionId === sessionId ? false : client.connected,
    lastSeenAt: now,
    sessionId: client.sessionId === sessionId ? null : client.sessionId
  });
