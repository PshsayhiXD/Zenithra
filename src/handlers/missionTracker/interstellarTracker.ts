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

const logger = createLogger("Interstellar");

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
    if (trackerState?.event === undefined) continue;
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
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private alive = false;
  private lastSnapshot = "";
  private stopped = false;

  start(): void {
    this.stopped = false;
    this.connect();
  }

  private connect(): void {
    if (
      this.ws &&
      (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      )
    ) return;
    const agent = new HttpsProxyAgent(
      `http://${PROXY.HOST}:${String(PROXY.PORT)}`,
    );
    this.ws = new WebSocket(MISSION.TRACKER.INTERSTELLAR_WS_URL, { agent });
    this.ws.on("open", () => {
      this.alive = true;
      logger.info("connected");
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
      this.startHeartbeat();
    });

    this.ws.on("message", (d: WebSocket.RawData): void => {
      this.alive = true;
      const data = decode(d as Buffer) as InterstellarMessage;
      if (data.type !== 2 || data.event_state === undefined) return;
      const servers = toMissionServers(data.event_state);
      if (Object.keys(servers).length === 0) return;
      const snapshot = JSON.stringify(servers);
      if (snapshot !== this.lastSnapshot) {
        const previous = this.lastSnapshot
          ? JSON.parse(this.lastSnapshot) as Partial<
            Record<MissionServer, MissionData>
          >
          : {};
        const changes = Object.entries(servers)
          .filter(([server, missionData]) =>
            previous[server as MissionServer]?.mission !== missionData.mission
          )
          .map(([server, missionData]) => ({
            server,
            mission: missionData.mission,
          }));
        if (changes.length > 0) logger.info("mission.update", { changes });
        this.lastSnapshot = snapshot;
      }
      missionStore.setServers(servers);
    });

    this.ws.on("pong", () => {
      this.alive = true;
    });

    this.ws.on("close", () => {
      this.cleanup();
      if (!this.stopped) {
        logger.warn("disconnected");
        setTimeout(() => {
          if (!this.stopped) this.connect();
        }, MINUTE);
      }
    });
    this.ws.on("error", (error: unknown) => {
      const error_ =
        error instanceof Error ? error : new Error(String(error));
      logger.error(error_);
      this.ws?.terminate();
    });
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer !== null) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval((): void => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      if (!this.alive) {
        this.ws.terminate();
        return;
      }
      this.alive = false;
      this.ws.ping();
    }, MINUTE);
  }

  private cleanup(): void {
    this.alive = false;
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  stop(): void {
    this.stopped = true;
    this.cleanup();
    this.ws?.close();
  }

  isAlive(): boolean {
    return this.alive;
  }
}

export const interstellarTracker = new InterstellarTracker();
