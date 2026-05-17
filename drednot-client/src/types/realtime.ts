export interface RealtimeEnvelope<TPayload = unknown> {
  type: string;
  payload: TPayload;
  id?: string;
}

export interface ClientHooks {
  onRegistered?(clientId: string): void;
  onOpen?(): void;
  onClose?(): void;
  onMessage?(message: RealtimeEnvelope): void;
  onError?(error: unknown): void;
}
