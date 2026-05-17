import type { BrowserRuntime } from "@DClient/types/browser.js";
import { getConfig } from "@DClient/config.js";

declare global {
  var Interstellar: unknown;
}

export const hasInterstellar = (): boolean => Boolean(globalThis.Interstellar);

export const resolveBaseUrl = (): string => {
  const { backendUrl } = getConfig();
  if (typeof backendUrl === "string" && backendUrl.length > 0) return backendUrl;
  return globalThis.location.origin;
};

export const getBrowserRuntime = (): BrowserRuntime => ({
  baseUrl: resolveBaseUrl(),
  fetch: globalThis.fetch.bind(globalThis),
  WebSocket: globalThis.WebSocket,
  storage: globalThis.localStorage,
});
