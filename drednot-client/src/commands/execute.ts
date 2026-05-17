import type { BrowserRuntime } from "@DClient/types/browser.js";
import type { ExecuteCommandOptions, ExecuteCommandResponse } from "@DClient/types/command.js";
import { requestJson } from "@DClient/transport/http.js";

export const executeCommand = (
  runtime: BrowserRuntime,
  httpBaseUrl: string,
  options: ExecuteCommandOptions,
  fallbackUserId: string
): Promise<ExecuteCommandResponse> =>
  requestJson<ExecuteCommandResponse>(runtime, httpBaseUrl, "/command/execute", {
    method: "POST",
    body: {
      input: options.input,
      userId: options.userId ?? fallbackUserId,
      username: options.username ?? "Drednot_User",
    },
  });
