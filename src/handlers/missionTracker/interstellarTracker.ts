import { decode, encode } from "@msgpack/msgpack";
import { HttpsProxyAgent } from "https-proxy-agent";
import WebSocket from "ws";
import { PROXY } from "@configs/proxy.js";
import { MISSION } from "@configs/mission.js";
import { missionStore } from "@handlers/missionTracker/store.js";
import type {
  MissionData,
  MissionServer,
} from "@handlers/missionTracker/type.js";
import { createLogger } from "@utilities/logger.js";
import { MINUTE } from "@utilities/time.js";

type MissionTrackerState = Record<string, { event: string; time: number }>;

interface InterstellarMessage {
  type: number;
  event_state?: MissionTrackerState;
}

const log = createLogger("Interstellar");

const INTERSTELLAR_SERVER_MAP: Record<string, MissionServer> = {
  "psis-tracker": "persistent",
  "wipe-tracker": "wipe",
  "test-tracker": "test",
};

const toMissionServers = (
  state: MissionTrackerState,
): Partial<Record<MissionServer, MissionData>> => {
  const servers: Partial<Record<MissionServer, MissionData>> = {};
  const now = Date.now();

  for (const [trackerKey, server] of Object.entries(INTERSTELLAR_SERVER_MAP)) {
    const trackerState = state[trackerKey];
    if (trackerState?.event === undefined) {
      continue;
    }
    servers[server] = {
      mission: trackerState.event,
      location: "Raven",
      startTime: trackerState.time * 1000,
      setAt: now,
    };
  }

  return servers;
};

class InterstellarTracker {
  private ws?: WebSocket;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private alive = false;
  private lastSnapshot = "";
  /** Set to true by stop() so the close handler knows not to reconnect. */
  private stopped = false;

  start(): void {
    this.stopped = false;
    this.connect();
  }

  private connect(): void {
    const agent = new HttpsProxyAgent(
      `http://${PROXY.HOST}:${String(PROXY.PORT)}`,
    );
    log.info("ws.connect.start", { url: MISSION.TRACKER.INTERSTELLAR_WS_URL });
    this.ws = new WebSocket(MISSION.TRACKER.INTERSTELLAR_WS_URL, { agent });

    this.ws.on("open", () => {
      log.info("ws.connect.success");
      this.alive = true;
      this.ws?.send(
        encode({
          type: 1,
          name: null,
          color: null,
          mods: [],
          gpu: null,
          user_agent: "node",
        }),
      );
    });

    this.ws.on("message", (d: WebSocket.RawData): void => {
      const data = decode(d as Buffer) as InterstellarMessage;
      if (data.type !== 2 || data.event_state === undefined) {
        if (data.type !== 3) {
          log.warn("ws.message.unknown", { type: data.type });
        }
        return;
      }
      const servers = toMissionServers(data.event_state);
      if (Object.keys(servers).length === 0) {
        log.warn("ws.message.invalid_event");
        return;
      }

      const snapshot = JSON.stringify(servers);
      if (this.lastSnapshot !== snapshot) {
        this.lastSnapshot = snapshot;
        log.info("ws.message.mission_update", {
          servers,
        });
      }

      missionStore.setServers(servers);
    });

    this.ws.on("close", () => {
      log.warn("ws.close");
      this.alive = false;
      if (!this.stopped) this.scheduleReconnect();
    });

    this.ws.on("error", (error: unknown) => {
      const error_ =
        error instanceof Error ? error : new Error(String(error));
      log.error(error_, { phase: "ws.error" });
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return;
    log.info("ws.reconnect.scheduled", { delayMs: MINUTE });
    this.reconnectTimer = setTimeout((): void => {
      this.reconnectTimer = null;
      log.info("ws.reconnect.attempt");
      this.connect();
    }, MINUTE);
  }

  stop(): void {
    this.stopped = true;
    this.alive = false;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    log.info("ws.stop");
  }

  isAlive(): boolean {
    return this.alive;
  }
}

export const interstellarTracker = new InterstellarTracker();
