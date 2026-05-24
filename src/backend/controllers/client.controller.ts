import type { IncomingMessage, ServerResponse } from "node:http";
import type { ClientRegistrationResponse } from "@backend/domain/client/types.js";
import { registerClient } from "@backend/services/client.service.js";
import { readJsonBody } from "@backend/utils/body.js";
import { sendJson } from "@backend/utils/response.js";
import { REALTIME_PATH, resolvePublicBaseUrl } from "@backend/utils/config.js";

export const registerClientRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const existingClientId = typeof body?.["clientId"] === "string" ? body["clientId"] : undefined;
    const userAgent = request.headers["user-agent"];
    const registration = registerClient({
      ...(existingClientId === undefined ? {} : { existingClientId }),
      ...(typeof userAgent === "string" ? { userAgent } : {})
    });

    const payload: ClientRegistrationResponse = {
      clientId: registration.client.clientId,
      config: {
        httpBaseUrl: resolvePublicBaseUrl(request),
        realtimePath: REALTIME_PATH
      }
    };

    sendJson(response, 200, payload);
  } catch (error: unknown) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
