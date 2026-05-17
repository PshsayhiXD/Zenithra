import http from "node:http";
import localtunnel from "localtunnel";
import { createLogger } from "@utilities/logger.js";
import { BACKEND_HOST, BACKEND_PORT, toWebSocketBaseUrl } from "@backend/utils/config.js";
import { handleRequest } from "@backend/app.js";
import { bindWebSocketServer } from "@backend/realtime/websocket.js";

const log = createLogger("Backend");

let server: http.Server | undefined;

export const startBackendServer = (): http.Server => {
  if (server !== undefined) return server;

  server = http.createServer((request, response) => {
    void handleRequest(request, response).catch((error: unknown) => {
      const error_ = error instanceof Error ? error : new Error(String(error));

      log.error(error_, { event: "requestFailed" });

      if (response.headersSent) {
        response.end();
      } else {
        response.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8"
        });

        response.end(JSON.stringify({
          error: "Internal server error."
        }));
      }
    });
  });

  bindWebSocketServer(server);

  server.listen(BACKEND_PORT, BACKEND_HOST, (): void => {
    const httpBaseUrl = `http://${BACKEND_HOST}:${String(BACKEND_PORT)}`;
    log.info(`Backend listening on ${httpBaseUrl}`);
    log.info(`WebSocket listening on ${toWebSocketBaseUrl(httpBaseUrl)}`);

    localtunnel({ port: BACKEND_PORT })
      .then((tunnel) => {
        log.info(`Localtunnel listening on ${tunnel.url}`);
        log.info(`Localtunnel WebSocket endpoint ${toWebSocketBaseUrl(tunnel.url)}`);

        tunnel.on("close", (): void => {
          log.info("Localtunnel closed.");
        });

        tunnel.on("error", (error: Error): void => {
          log.error(error, { event: "localtunnelError" });
        });
      })
      .catch((error: unknown) => {
        const error_ = error instanceof Error ? error : new Error(String(error));

        log.error(error_, { event: "localtunnelStartFailed" });
      });
  });

  server.on("error", (error: Error): void => {
    log.error(error, { event: "serverError" });
  });

  return server;
};
