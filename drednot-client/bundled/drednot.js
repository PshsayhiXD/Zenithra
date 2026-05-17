// drednot-client/src/browser.ts
var hasInterstellar = () => Boolean(globalThis.Interstellar);
var resolveBaseUrl = () => {
  const configuredBaseUrl = globalThis.ZenithraClientConfig?.backendUrl;
  if (typeof configuredBaseUrl === "string" && configuredBaseUrl.length > 0) {
    return configuredBaseUrl;
  }
  return globalThis.location.origin;
};
var getBrowserRuntime = () => ({
  baseUrl: resolveBaseUrl(),
  fetch: globalThis.fetch.bind(globalThis),
  WebSocket: globalThis.WebSocket,
  storage: globalThis.localStorage
});

// drednot-client/src/client.ts
var CLIENT_ID_STORAGE_KEY = "zenithra.clientId";
var HEARTBEAT_INTERVAL_MS = 3e4;
var RECONNECT_DELAY_MS = 1500;
var normalizeBaseUrl = (value) => value.replace(/\/+$/u, "");
var isObjectRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var toWsUrl = (httpUrl) => httpUrl.replace(/^http:\/\//u, "ws://").replace(/^https:\/\//u, "wss://");
var ZenithraClient = class {
  constructor(runtime, hooks = {}) {
    this.runtime = runtime;
    this.hooks = hooks;
    this.clientId = this.runtime.storage?.getItem(CLIENT_ID_STORAGE_KEY) ?? null;
    this.httpBaseUrl = normalizeBaseUrl(runtime.baseUrl);
  }
  clientId;
  socket = null;
  heartbeat;
  reconnectTimer;
  httpBaseUrl;
  get registeredClientId() {
    return this.clientId;
  }
  get baseUrl() {
    return this.httpBaseUrl;
  }
  async start() {
    const registration = await this.register();
    this.clientId = registration.clientId;
    this.httpBaseUrl = normalizeBaseUrl(registration.config?.httpBaseUrl ?? this.runtime.baseUrl);
    this.runtime.storage?.setItem(CLIENT_ID_STORAGE_KEY, registration.clientId);
    this.hooks.onRegistered?.(this);
    this.connect(registration);
  }
  async parseCommand(input) {
    return this.requestJson("/command/parse", {
      method: "POST",
      body: {
        input
      }
    });
  }
  async executeCommand(options) {
    return this.requestJson("/command/execute", {
      method: "POST",
      body: {
        input: options.input,
        userId: options.userId ?? this.clientId ?? "0",
        username: options.username ?? "Drednot_User"
      }
    });
  }
  sendRealtime(message) {
    if (this.socket?.readyState !== this.runtime.WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
  }
  async register() {
    return this.requestJson("/client/register", {
      method: "POST",
      body: this.clientId === null ? {} : { clientId: this.clientId }
    });
  }
  async requestJson(pathname, options) {
    const response = await this.runtime.fetch(new URL(pathname, `${this.httpBaseUrl}/`), {
      method: options.method,
      headers: {
        "Content-Type": "application/json"
      },
      ...options.body === void 0 ? {} : { body: JSON.stringify(options.body) }
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(
        isObjectRecord(payload) && typeof payload.error === "string" ? payload.error : `Request failed with status ${String(response.status)}.`
      );
    }
    return payload;
  }
  connect(registration) {
    this.clearReconnectTimer();
    this.clearHeartbeat();
    const realtimePath = registration.config?.realtimePath ?? "/realtime";
    const socketUrl = new URL(realtimePath, `${toWsUrl(this.httpBaseUrl)}/`);
    const socket = new this.runtime.WebSocket(socketUrl.toString());
    this.socket = socket;
    socket.addEventListener("open", () => {
      this.sendRealtime({
        type: "client.register",
        payload: {
          clientId: registration.clientId
        }
      });
      this.heartbeat = globalThis.setInterval(() => {
        this.sendRealtime({
          type: "heartbeat.ping",
          payload: {
            timestamp: Date.now()
          }
        });
      }, HEARTBEAT_INTERVAL_MS);
      this.hooks.onOpen?.(this);
    });
    socket.addEventListener("message", (event) => {
      this.handleMessage(event.data);
    });
    socket.addEventListener("close", () => {
      this.socket = null;
      this.clearHeartbeat();
      this.hooks.onClose?.(this);
      this.scheduleReconnect();
    });
  }
  handleMessage(data) {
    if (typeof data !== "string") return;
    const message = JSON.parse(data);
    if (message.type === "error") {
      this.hooks.onError?.(message.payload, this);
      console.error("[ZenithraClient]", message.payload);
      return;
    }
    this.hooks.onMessage?.(message, this);
  }
  scheduleReconnect() {
    if (this.reconnectTimer !== void 0) return;
    this.reconnectTimer = globalThis.setTimeout(() => {
      this.reconnectTimer = void 0;
      void this.start().catch((error) => {
        this.hooks.onError?.(error, this);
        console.error("[ZenithraClient]", error);
        this.scheduleReconnect();
      });
    }, RECONNECT_DELAY_MS);
  }
  clearHeartbeat() {
    if (this.heartbeat === void 0) return;
    globalThis.clearInterval(this.heartbeat);
    this.heartbeat = void 0;
  }
  clearReconnectTimer() {
    if (this.reconnectTimer === void 0) return;
    globalThis.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = void 0;
  }
};
var startZenithraClient = async (runtime, hooks) => {
  const client = new ZenithraClient(runtime, hooks);
  await client.start();
  return client;
};

// drednot-client/src/drednot.ts
var DrednotApp = class {
  client = null;
  async start() {
    this.client = await startZenithraClient(getBrowserRuntime(), {
      onError(error) {
        console.error("[DrednotApp]", error);
      }
    });
  }
  async parseChatCommand(input) {
    if (this.client === null) throw new Error("Drednot app has not started.");
    return this.client.parseCommand(input);
  }
  async executeChatCommand(context) {
    if (this.client === null) throw new Error("Drednot app has not started.");
    return this.client.executeCommand({
      input: context.input,
      username: context.username,
      userId: context.userId
    });
  }
};
var promptForInterstellar = () => {
  if (hasInterstellar()) return;
  const shouldJoin = confirm(
    [
      "It looks like you didn't install Interstellar.",
      "Zenithra Client requires Interstellar API to run properly.",
      "Press OK to join the Interstellar Discord server.",
      "Interstellar is not part of Zenithra.",
      "Zenithra Client is a client for Drednot, and Interstellar is the API used by Zenithra."
    ].join("\n")
  );
  if (shouldJoin) globalThis.open("https://discord.gg/RudT9ZTaFA", "_blank");
};
promptForInterstellar();
var app = new DrednotApp();
void app.start().catch((error) => {
  console.error("[DrednotApp]", error);
});
export {
  DrednotApp,
  app as drednotApp
};
//# sourceMappingURL=drednot.js.map
