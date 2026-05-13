import { decode, encode } from "@msgpack/msgpack";
import { HttpsProxyAgent } from "https-proxy-agent";
import WebSocket from "ws";
import { PROXY } from "@configs/proxy.js";
import { MISSION } from "@configs/mission.js";
import { missionStore } from "@handlers/missionTracker/store.js";
import { createLogger } from "@utilities/logger.js";
import { MINUTE } from "@utilities/time.js";

type MissionTrackerState = Record<string, { event: string; time: number }>;

interface InterstellarMessage {
  type: number;
  event_state?: MissionTrackerState;
}

const log = createLogger("Interstellar");

const pickMission = (
  state: MissionTrackerState,
): { event: string; time: number } | undefined => {
  const priority = ["psis-tracker", "wipe-tracker", "test-tracker"];
  for (const key of priority) {
    if (state[key] !== undefined) return state[key];
  }
  return Object.values(state)[0];
};

class InterstellarTracker {
  private ws?: WebSocket;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private alive = false;
  private lastMission = "";
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
      const selected = pickMission(data.event_state);
      if (selected?.event === undefined) {
        log.warn("ws.message.invalid_event");
        return;
      }
      if (this.lastMission !== selected.event) {
        this.lastMission = selected.event;
        log.info("ws.message.mission_update", {
          event: selected.event,
          time: selected.time,
        });
      }
      missionStore.set({
        mission: selected.event,
        location: "Raven",
        startTime: selected.time * 1000,
        setAt: Date.now(),
        version: 0,
      });
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
