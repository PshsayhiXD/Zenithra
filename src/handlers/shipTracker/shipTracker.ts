import { createLogger } from "@utilities/logger.js";
import type {
  PublicPersistentShips,
  PublicEphemeralShips,
  ShipFromLink,
} from "./type.js";

const log = createLogger("ShipTracker");

const getAnonKey = (): string => process.env["DREDNOT_ANONYMOUS_KEY"] ?? "";

const shipListHeaders = (): Record<string, string> => ({
  Cookie: `anon_key=${getAnonKey()}`,
});

export const getPublicPersistentShips = async (): Promise<PublicPersistentShips> => {
  const response = await fetch("https://drednot.io/shiplist?server=0", {
    headers: shipListHeaders(),
  });
  if (!response.ok) {
    const error = new Error(`Failed to fetch persistent ships: HTTP ${String(response.status)}`);
    log.error(error, { phase: "getPublicPersistentShips" });
    throw error;
  }
  return response.json() as Promise<PublicPersistentShips>;
};

export const getPublicEphemeralShips = async (): Promise<PublicEphemeralShips> => {
  const response = await fetch("https://drednot.io/shiplist?server=1", {
    headers: shipListHeaders(),
  });
  if (!response.ok) {
    const error = new Error(`Failed to fetch ephemeral ships: HTTP ${String(response.status)}`);
    log.error(error, { phase: "getPublicEphemeralShips" });
    throw error;
  }
  return response.json() as Promise<PublicEphemeralShips>;
};

export const getShipFromLink = async (
  link: string,
): Promise<ShipFromLink | { valid: false }> => {
  try {
    const response = await fetch(link, { headers: shipListHeaders() });
    if (!response.ok) return { valid: false };
    const html = await response.text();
    const ogTitleMatch =
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i.exec(html);
    const ogImageMatch =
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i.exec(html);
    const ogTitle = ogTitleMatch?.[1] ?? "";
    const ogImage = ogImageMatch?.[1] ?? null;
    const shipName = ogTitle
      .replace(/^(invite:|ship:)\s*/i, "")
      .replace(/\s*[|-]\s*drednot\.io$/i, "")
      .trim();
    if (!shipName || shipName === "Deep Space Airships") return { valid: false };
    return { valid: true, shipName, shipImage: ogImage };
  } catch (error: unknown) {
    log.error(
      error instanceof Error ? error : new Error(String(error)),
      { phase: "getShipFromLink", link },
    );
    return { valid: false };
  }
};
