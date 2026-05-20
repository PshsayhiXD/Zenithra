export interface BrowserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface BrowserRuntime {
  baseUrl: string;
  fetch: typeof window.fetch;
  WebSocket: typeof window.WebSocket;
  storage?: BrowserStorage;
}
