import type { BrowserRuntime } from "@DClient/types/browser.js";
import type { ParsedCommandResponse } from "@DClient/types/command.js";
import { requestJson } from "@DClient/transport/http.js";

export const parseCommand = (
  runtime: BrowserRuntime,
  httpBaseUrl: string,
  input: string
): Promise<ParsedCommandResponse> =>
  requestJson<ParsedCommandResponse>(runtime, httpBaseUrl, "/command/parse", {
    method: "POST",
    body: { input },
  });
