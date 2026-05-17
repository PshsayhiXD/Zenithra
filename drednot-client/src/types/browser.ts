export interface BrowserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface BrowserRuntime {
  baseUrl: string;
  fetch: typeof globalThis.fetch;
  WebSocket: typeof globalThis.WebSocket;
  storage?: BrowserStorage;
}
