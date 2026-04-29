import { PROXY } from "@config/proxy";
import { createLogger } from "@utilities/logger";
import http, { type IncomingMessage } from "node:http";
import net, { type Socket } from "node:net";

const logger = createLogger("Proxy");

const server = http.createServer();
server.on("connect", (request: IncomingMessage, clientSocket: Socket, head: Buffer): void => {
  const target = request.url;
  if (target === undefined || target === "") {
    clientSocket.destroy();
    return;
  }
  const [host, portRaw] = target.split(":");
  const port = Number(portRaw) || 443;
  const serverSocket = net.connect(port, host, (): void => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    if (head.length > 0) serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
  serverSocket.setNoDelay(true);
  clientSocket.setNoDelay(true);
  const cleanup = (): void => {
    serverSocket.destroy();
    clientSocket.destroy();
  };
  serverSocket.setTimeout(PROXY.TIMEOUT_MS, cleanup);
  clientSocket.setTimeout(PROXY.TIMEOUT_MS, cleanup);
  serverSocket.once("error", cleanup);
  clientSocket.once("error", cleanup);
  serverSocket.once("close", cleanup);
  clientSocket.once("close", cleanup);
});
server.listen(PROXY.PORT, PROXY.HOST, (): void => {
  logger.info("listening on", { host: PROXY.HOST, port: PROXY.PORT });
});
