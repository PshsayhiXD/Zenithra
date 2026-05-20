import type { ClientRecord, ClientRegistrationInput, ClientRegistrationResult } from "@backend/domain/client/types.js";
import {
  createClientRegistration,
  markClientConnected,
  markClientDisconnected
} from "@backend/domain/client/client.js";
import { Cache } from "@/utilities/cache.js";

const registryCache = new Cache<ClientRecord>("client-registry", "file").init();

export const registerClient = (input: ClientRegistrationInput): ClientRegistrationResult => {
  const existingClient =
    input.existingClientId === undefined
      ? undefined
      : registryCache.get(input.existingClientId);

  const registration = createClientRegistration(input, existingClient);
  registryCache.set(registration.client.clientId, registration.client);

  return registration;
};

export const getClient = (clientId: string): ClientRecord | undefined => registryCache.get(clientId);

export const connectClientSession = (clientId: string, sessionId: string): ClientRecord | undefined => {
  const client = registryCache.get(clientId);
  if (client === undefined) return undefined;

  const updatedClient = markClientConnected(client, sessionId);
  registryCache.set(clientId, updatedClient);
  return updatedClient;
};

export const disconnectClientSession = (clientId: string, sessionId: string): ClientRecord | undefined => {
  const client = registryCache.get(clientId);
  if (client === undefined) return undefined;

  const updatedClient = markClientDisconnected(client, sessionId);
  registryCache.set(clientId, updatedClient);
  return updatedClient;
};
