import type {
  PublicPersistentShips,
  PublicEphemeralShips,
  ShipFromLink,
} from "./type.js";

export const getPublicPersistentShips = async (): Promise<PublicPersistentShips> => {
  const anonKey = process.env["DREDNOT_ANONYMOUS_KEY"] ?? "";
  const response = await fetch("https://drednot.io/shiplist?server=0", {
    headers: {
      Cookie: `anon_key=${anonKey}`,
    },
  });
  const data = (await response.json()) as PublicPersistentShips;
  return data;
};

export const getPublicEphemeralShips = async (): Promise<PublicEphemeralShips> => {
  const anonKey = process.env["DREDNOT_ANONYMOUS_KEY"] ?? "";
  const response = await fetch("https://drednot.io/shiplist?server=1", {
    headers: {
      Cookie: `anon_key=${anonKey}`,
    },
  });
  const data = (await response.json()) as PublicEphemeralShips;
  return data;
};

export const getShipFromLink = async (link: string): Promise<ShipFromLink | { valid: false }> => {
  try {
    const anonKey = process.env["DREDNOT_ANONYMOUS_KEY"] ?? "";
    const response = await fetch(link, {
      headers: {
        Cookie: `anon_key=${anonKey}`,
      },
    });
    if (!response.ok) return { valid: false };
    const html = await response.text();
    const ogTitleMatch = /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i.exec(html);
    const ogImageMatch = /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i.exec(html);
    const ogTitle = ogTitleMatch?.[1] ?? "";
    const ogImage = ogImageMatch?.[1] ?? null;
    const shipName = ogTitle.replace(/^(invite:|ship:)\s*/i, "").replace(/\s*[|-]\s*drednot\.io$/i, "").trim();
    if (!shipName || shipName === "Deep Space Airships") return { valid: false };
    return {
      valid: true,
      shipName,
      shipImage: ogImage,
    };
  } catch {
    return { valid: false };
  }
};
