export type CommandDispatchTransport = "http" | "websocket";

export interface CommandDispatchRequest {
  clientId: string;
  input: string;
  transport: CommandDispatchTransport;
}
