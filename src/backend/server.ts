import fs from "node:fs";
import https from "node:https";
import { createLogger } from "@utilities/logger.js";
import { BACKEND_HOST, BACKEND_PORT, toWebSocketBaseUrl, FILEPATH } from "@backend/utils/config.js";
import { handleRequest } from "@backend/app.js";
import { bindWebSocketServer } from "@backend/realtime/websocket.js";

const log = createLogger("Backend");

let server: https.Server | undefined;

export const startBackendServer = (): https.Server | null => {
  if (server !== undefined) return server;
  if (FILEPATH.certificate[0] === "" || FILEPATH.certificate[1] === "") {
    log.error("Backend FILEPATH Invalid. Maybe try 'npm run mkcert' and try again");
    return null;
  }
  server = https.createServer(
    {
      cert: fs.readFileSync(FILEPATH.certificate[0]),
      key: fs.readFileSync(FILEPATH.certificate[1]),
    },
    (request, response) => {
      void handleRequest(request, response).catch((error: unknown) => {
        const error_ = error instanceof Error ? error : new Error(String(error));
        log.error(error_, {
          event: "requestFailed"
        });
        if (response.headersSent) response.end();
        else {
          response.writeHead(500, {
            "Content-Type": "application/json; charset=utf-8"
          });
          response.end(JSON.stringify({
            error: "Internal server error."
          }));
        }
      });
    }
  );

  bindWebSocketServer(server);

  server.listen(BACKEND_PORT, BACKEND_HOST, (): void => {
    const httpsBaseUrl = `https://${BACKEND_HOST}:${String(BACKEND_PORT)}`;
    log.info(`Backend listening on ${httpsBaseUrl}`);
    log.info(`WebSocket listening on ${toWebSocketBaseUrl(httpsBaseUrl)}`);
  });

  server.on("error", (error: Error): void => {
    log.error(error, {
      event: "serverError"
    });
  });

  return server;
};
