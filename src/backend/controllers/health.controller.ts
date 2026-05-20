import type { ServerResponse } from "node:http";
import { sendJson } from "@backend/utils/http.js";
import { listCommands } from "@backend/services/command.service.js";
import { BACKEND_HOST, BACKEND_PORT, REALTIME_PATH } from "@backend/utils/config.js";

export const getRootOrRoutes = (response: ServerResponse): void => {
  sendJson(response, 200, {
    service: "Zenithra-backend",
    routes: [
      { method: "GET", path: "/health" },
      { method: "POST", path: "/client/register" },
      { method: "GET", path: "/command" },
      { method: "GET", path: "/command/:name" },
      { method: "POST", path: "/command/parse" },
      { method: "POST", path: "/command/execute" },
      { method: "GET", path: "/chat/link" },
      { method: "POST", path: "/chat/link" },
      { method: "GET", path: "/chat/identity" },
      { method: "POST", path: "/chat/identity" },
      { method: "POST", path: "/chat/message" },
      { method: "GET", path: "/runtime/config" },
      { method: "GET", path: "/transport/socket" },
      { method: "POST", path: "/transport/http" },
    ],
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
