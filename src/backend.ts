import { startBackendServer } from "@backend/server.js";
import { startNgrok } from "@/ngrok.js";

export const bootstrap = async (): Promise<void> => {
  startBackendServer();
  await startNgrok();
};
