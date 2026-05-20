import type { BrowserRuntime } from "@DClient/types/browser.js";
import {
  type ZenithraConfig,
  getConfig
} from "@DClient/config.js";
import { BACKEND_PORT } from "@backend/config";

declare global {
  interface Window {
    Interstellar: Record<string, unknown>;
    StellarExports: Record<string, unknown>;
    ZenithraClientConfig:
      | ZenithraConfig
      | undefined;

    StellarAPI: {
      sendChat?: (message: string) => void;
      [key: string]: unknown;
    };
  }
}

export const hasInterstellar = (): boolean => Boolean(window.Interstellar);

export const resolveBaseUrl = (): string => {
  const globalUrl = window.ZenithraClientConfig?.backendUrl;
  if (typeof globalUrl === "string" && globalUrl.length > 0) return globalUrl;
  const { backendUrl } = getConfig();
  if (typeof backendUrl === "string" && backendUrl.length > 0) return backendUrl;
  // default if not set
  const { protocol, hostname } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return `https://localhost:${String(BACKEND_PORT)}`;
  }

  return window.location.origin;
};

export const getBrowserRuntime = (): BrowserRuntime => ({
  baseUrl: resolveBaseUrl(),
  fetch: window.fetch.bind(window),
  WebSocket: window.WebSocket,
  storage: window.localStorage,
});
