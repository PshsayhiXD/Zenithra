import type { BrowserRuntime } from "@DClient/types/browser.js";

interface BackendErrorResponse {
  error?: string;
}

export interface ClientRegistrationResponse {
  clientId: string;
  config?: {
    httpBaseUrl?: string;
    realtimePath?: string;
  };
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const requestJson = async <TResponse>(
  runtime: BrowserRuntime,
  httpBaseUrl: string,
  pathname: string,
  options: { method: "GET" | "POST"; body?: Record<string, unknown> }
): Promise<TResponse> => {
  const response = await runtime.fetch(new URL(pathname, `${httpBaseUrl}/`), {
    method: options.method,
    headers: { "Content-Type": "application/json" },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  const payload = (await response.json()) as TResponse | BackendErrorResponse;
  if (!response.ok) {
    throw new Error(
      isObjectRecord(payload) && typeof payload["error"] === "string"
        ? payload["error"]
        : `Request failed with status ${String(response.status)}.`
    );
  }
  return payload as TResponse;
};

export const registerClient = (
  runtime: BrowserRuntime,
  httpBaseUrl: string,
  clientId: string | null
): Promise<ClientRegistrationResponse> =>
  requestJson<ClientRegistrationResponse>(runtime, httpBaseUrl, "/client/register", {
    method: "POST",
    body: clientId === null ? {} : { clientId },
  });
