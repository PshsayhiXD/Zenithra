import type { BrowserRuntime } from "@DClient/types/browser.js";
import type { ClientHooks, RealtimeEnvelope } from "@DClient/types/realtime.js";

const HEARTBEAT_INTERVAL_MS = 30_000;

export interface SocketHandle {
  send<TPayload>(message: RealtimeEnvelope<TPayload>): void;
  disconnect(): void;
}

export const connectSocket = (
  runtime: BrowserRuntime,
  socketUrl: string,
  clientId: string,
  hooks: ClientHooks,
  onClose: () => void
): SocketHandle => {
  let heartbeat: number | undefined;

  const ws = new runtime.WebSocket(socketUrl);

  const send = <TPayload>(message: RealtimeEnvelope<TPayload>): void => {
    if (ws.readyState !== runtime.WebSocket.OPEN) return;
    ws.send(JSON.stringify(message));
  };

  const clearHeartbeat = (): void => {
    if (heartbeat === undefined) return;
    window.clearInterval(heartbeat);
    heartbeat = undefined;
  };

  ws.addEventListener("open", () => {
    send({ type: "client.register", payload: { clientId } });
    heartbeat = window.setInterval(() => {
      send({ type: "heartbeat.ping", payload: { timestamp: Date.now() } });
    }, HEARTBEAT_INTERVAL_MS);
    hooks.onOpen?.();
  });

  ws.addEventListener("message", (event) => {
    if (typeof event.data !== "string") return;
    const message = JSON.parse(event.data) as RealtimeEnvelope;
    if (message.type === "error") {
      hooks.onError?.(message.payload);
      console.error("[ZenithraClient]", message.payload);
      return;
    }
    hooks.onMessage?.(message);
  });

  ws.addEventListener("close", () => {
    clearHeartbeat();
    hooks.onClose?.();
    onClose();
  });

  return {
    send,
    disconnect: (): void => {
      clearHeartbeat();
      ws.close();
    },
  };
};
