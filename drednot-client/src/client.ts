import type { BrowserRuntime } from "@DClient/types/browser.js";
import type { ClientHooks, RealtimeEnvelope } from "@DClient/types/realtime.js";
import { registerClient, type ClientRegistrationResponse } from "@DClient/transport/http.js";
import { connectSocket } from "@DClient/transport/socket.js";

export type { ClientHooks, RealtimeEnvelope };

interface SendCommandResponse {
  result: unknown;
  replies: string[];
};

const CLIENT_ID_KEY = "zenithra.clientId";
const RECONNECT_DELAY_MS = 1500;

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/u, "");

export const toWsUrl = (httpUrl: string): string =>
  httpUrl.replace(/^http:\/\//u, "ws://").replace(/^https:\/\//u, "wss://");

export class ZenithraClient {
  private clientId: string | null;
  private httpBaseUrl: string;
  private reconnectTimer: number | undefined;

  constructor(
    private readonly runtime: BrowserRuntime,
    private readonly hooks: ClientHooks = {},
  ) {
    this.clientId = this.runtime.storage?.getItem(CLIENT_ID_KEY) ?? null;
    this.httpBaseUrl = normalizeBaseUrl(runtime.baseUrl);
  }

  get registeredClientId(): string | null {
    return this.clientId;
  }

  get baseUrl(): string {
    return this.httpBaseUrl;
  }

  async start(): Promise<void> {
    const registration = await registerClient(this.runtime, this.httpBaseUrl, this.clientId);
    this.applyRegistration(registration);
    this.connect(registration);
  }

  async sendCommand(options: {
    input: string;
    userId?: string;
    username?: string;
    guildId?: string;
    rank?: number;
    badges?: string[];
  }): Promise<SendCommandResponse> {
    const url = new URL("/command/execute", `${this.httpBaseUrl}/`);
    const response = await this.runtime.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    return (await response.json()) as SendCommandResponse;
  }

  private applyRegistration(reg: ClientRegistrationResponse): void {
    this.clientId = reg.clientId;
    this.httpBaseUrl = normalizeBaseUrl(reg.config?.httpBaseUrl ?? this.runtime.baseUrl);
    this.runtime.storage?.setItem(CLIENT_ID_KEY, reg.clientId);
    this.hooks.onRegistered?.(reg.clientId);
  }

  private connect(registration: ClientRegistrationResponse): void {
    this.clearReconnectTimer();
    const realtimePath = registration.config?.realtimePath ?? "/realtime";
    const socketUrl = new URL(realtimePath, `${toWsUrl(this.httpBaseUrl)}/`).toString();
    connectSocket(this.runtime, socketUrl, registration.clientId, this.hooks, () => {
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== undefined) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.start().catch((error: unknown) => {
        this.hooks.onError?.(error);
        console.error("[ZenithraClient]", error);
        this.scheduleReconnect();
      });
    }, RECONNECT_DELAY_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer === undefined) return;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }
}

export const startZenithraClient = async (
  runtime: BrowserRuntime,
  hooks?: ClientHooks,
): Promise<ZenithraClient> => {
  const client = new ZenithraClient(runtime, hooks);
  await client.start();
  return client;
};
