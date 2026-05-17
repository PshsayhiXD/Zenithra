export interface ClientRecord {
  clientId: string;
  createdAt: number;
  updatedAt: number;
  lastSeenAt: number;
  connected: boolean;
  sessionId: string | null;
  userAgent: string | null;
}

export interface ClientRegistrationInput {
  existingClientId?: string;
  userAgent?: string;
}

export interface ClientRegistrationResult {
  client: ClientRecord;
  created: boolean;
}

export interface ClientTransportConfig {
  httpBaseUrl: string;
  realtimePath: string;
}

export interface ClientRegistrationResponse {
  clientId: string;
  config: ClientTransportConfig;
}
