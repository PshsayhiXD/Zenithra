import ngrok from "@ngrok/ngrok";
import "@environment";
import { Warning, Failed, createLogger } from "@utilities/logger.js";
import { BACKEND_URL } from "@backend/utils/config.js";

// ngrok is optional
// use your own hosting if you need.
// freely to change this file
const logger = createLogger("Ngrok")
export const startNgrok = async (): Promise<void> => {
  try {
    const authtoken = process.env["NGROK_AUTHTOKEN"];
    const domain = process.env["NGROK_DOMAIN"];
    if (authtoken === undefined || authtoken === "") throw new Failed("NGROK_AUTHTOKEN is not set, Skipping.", logger);
    if (domain === undefined || domain === "") throw new Warning("NGROK_DOMAIN is not set, Skipping.", logger);
    const listener: ngrok.Listener = await ngrok.connect({
      addr: BACKEND_URL,
      authtoken,
      domain,
    });
    const url = listener.url();
    if (url === null || url === "") throw new Failed("Failed to create ngrok tunnel.", logger);
    logger.info(`Ngrok tunnel established at ${url}`);
  } catch (error: unknown) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      { event: "ngrokStartFailed" },
    );
  }
};
