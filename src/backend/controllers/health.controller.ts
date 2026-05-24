import type { ServerResponse } from "node:http";
import { sendJson } from "@backend/utils/response.js";
import { listCommands } from "@backend/services/command.service.js";
import { BACKEND_HOST, BACKEND_PORT, REALTIME_PATH } from "@backend/utils/config.js";
import { discoverRoutes } from "@backend/utils/routeDiscovery.js";

export const getRootOrRoutes = (response: ServerResponse): void => {
  sendJson(response, 200, {
    service: "Zenithra-backend",
    routes: discoverRoutes(),
  });
};

export const getHealth = (response: ServerResponse): void => {
  sendJson(response, 200, {
    ok: true,
    host: BACKEND_HOST,
    port: BACKEND_PORT,
    realtimePath: REALTIME_PATH,
    commandsLoaded: listCommands().length,
  });
};
