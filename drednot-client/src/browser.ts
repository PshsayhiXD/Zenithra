import type { BrowserRuntime } from "@DClient/types/browser.js";
import type { ZenithraConfig } from "@DClient/config.js"
declare global {
  var Interstellar: unknown;
  var ZenithraClientConfig:
    | ZenithraConfig
    | undefined;
}

export const hasInterstellar = (): boolean => Boolean(globalThis.Interstellar);

export const resolveBaseUrl = (): string => {
  const configuredBaseUrl = globalThis.ZenithraClientConfig?.backendUrl;
  if (typeof configuredBaseUrl === "string" && configuredBaseUrl.length > 0) return configuredBaseUrl;
  return globalThis.location.origin;
};

export const getBrowserRuntime = (): BrowserRuntime => ({
  baseUrl: resolveBaseUrl(),
  fetch: globalThis.fetch.bind(globalThis),
  WebSocket: globalThis.WebSocket,
  storage: globalThis.localStorage
});
