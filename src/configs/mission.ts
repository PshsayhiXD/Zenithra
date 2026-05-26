export const MISSION = {
  PERSISTENT_START_TS: 1_775_966_594_670,
  TIMER_INTERVAL: 5,
  OPEN_DURATION: 15 * 60,
  CLOSE_DURATION: 30 * 60,
  OFFSET: 27,

  TRACKER: {
    USE_INTERSTELLAR: true as boolean, // as boolean is needed here for some reasons
    INTERSTELLAR_WS_URL: "wss://interstellarbackend.fomx.dev/ws",
  }
} as const;
