import type { IncomingMessage } from "node:http";

const MAX_BODY_SIZE = 32 * 1024;

export const readJsonBody = async (
  request: IncomingMessage,
): Promise<Record<string, unknown> | undefined> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    request.on("data", (chunk: Buffer | string): void => {
      const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      totalBytes += buffer.byteLength;
      if (totalBytes > MAX_BODY_SIZE) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }
      chunks.push(buffer);
    });

    request.on("end", (): void => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const parsed: unknown = JSON.parse(raw);
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          reject(new Error("Expected a JSON object body."));
          return;
        }
        resolve(parsed as Record<string, unknown>);
      } catch (error: unknown) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });

    request.on("error", (error: Error): void => {
      reject(error);
    });
  });
