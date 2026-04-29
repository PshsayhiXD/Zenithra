import sharp from "sharp";
import type { PublicShipList, PublicShip } from "@handlers/shipTracker/type.js";

type ShipSource = "persisted" | "ephemeral";
type DrawShip = PublicShip & { shipId: string; source?: ShipSource };
type DrawShipInput = PublicShipList | DrawShip[];

const escapeXml = (text: string | number | null | undefined): string => String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const getShipColor = (color: string): string => /^#([\da-f]{3}|[\da-f]{6})$/i.test(color) ? color : "#3b82f6";
const truncateText = (text: string, maxLength: number): string => text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;

const getLayout = (shipCount: number): { width: number; paddingX: number; paddingTop: number; paddingBottom: number; cols: number; tileSize: number; rowGap: number; colGap: number } => {
  const width = 1280;
  const paddingX = 14;
  const paddingTop = 14;
  const paddingBottom = 18;
  const safeCount = clamp(shipCount, 1, 50);
  if (safeCount <= 6) return { width, paddingX, paddingTop, paddingBottom, cols: 3, tileSize: 284, rowGap: 12, colGap: 12 };
  if (safeCount <= 12) return { width, paddingX, paddingTop, paddingBottom, cols: 4, tileSize: 216, rowGap: 10, colGap: 10 };
  if (safeCount <= 20) return { width, paddingX, paddingTop, paddingBottom, cols: 5, tileSize: 172, rowGap: 9, colGap: 9 };
  if (safeCount <= 30) return { width, paddingX, paddingTop, paddingBottom, cols: 6, tileSize: 138, rowGap: 7, colGap: 7 };
  if (safeCount <= 40) return { width, paddingX, paddingTop, paddingBottom, cols: 7, tileSize: 118, rowGap: 6, colGap: 6 };
  return { width, paddingX, paddingTop, paddingBottom, cols: 8, tileSize: 102, rowGap: 5, colGap: 5 };
};
const normalizeShips = (shipList: PublicShipList, source?: ShipSource): DrawShip[] => {
  const ships = Object.entries(shipList.ships).map(([shipId, ship]) => ({
    ...ship,
    shipId,
    ...(source === undefined ? {} : { source })
  }));
  return ships;
};
const drawShipCellSvg = (ship: DrawShip, index: number, x: number, y: number, tileSize: number, imageMap: Map<string, string>): string => {
  const shipImage = escapeXml(
    imageMap.has(ship.icon_path) ? imageMap.get(ship.icon_path) ?? "" : ""
  );
  const clipId = `shipTileClip${String(index)}`;
  const color = getShipColor(ship.color);
  let maxTeamNameLength = 9;
  if (tileSize >= 220) maxTeamNameLength = 16;
  else if (tileSize >= 160) maxTeamNameLength = 12;
  const teamName = escapeXml(truncateText(ship.team_name, maxTeamNameLength));
  const shipId = escapeXml(ship.shipId);
  const playerCount = escapeXml(ship.player_count);
  const hexCode = escapeXml(ship.hex_code);
  const radius = clamp(tileSize * 0.12, 12, 22);
  const footerHeight = clamp(tileSize * 0.24, 24, 44);
  const badgeWidth = clamp(tileSize * 0.28, 34, 56);
  const badgeHeight = clamp(tileSize * 0.14, 18, 28);
  const badgePad = clamp(tileSize * 0.05, 6, 10);
  const chipGap = clamp(tileSize * 0.03, 4, 8);
  const chipHeight = clamp(tileSize * 0.13, 16, 24);
  const savedWidth = clamp(tileSize * 0.26, 34, 58);
  const ownedWidth = clamp(tileSize * 0.26, 34, 58);
  const sourceWidth = clamp(tileSize * 0.34, 42, 72);
  const sourceHeight = clamp(tileSize * 0.12, 16, 22);
  const nameFontSize = clamp(tileSize * 0.08, 9, 16);
  const metaFontSize = clamp(tileSize * 0.048, 7, 11);
  const badgeFontSize = clamp(tileSize * 0.07, 9, 14);
  const chipFontSize = clamp(tileSize * 0.042, 7, 10);
  const sourceFontSize = clamp(tileSize * 0.04, 7, 10);
  let sourceLabel = "";
  let sourceFill = "";
  if (ship.source === "ephemeral") {
    sourceLabel = "EPHEMERAL";
    sourceFill = "#a855f7";
  } else if (ship.source === "persisted") {
    sourceLabel = "PERSISTED";
    sourceFill = "#10b981";
  }
  const sourceY = y + badgePad + ((ship.saved || ship.owned) ? chipHeight + chipGap : 0);
  return `
    <defs>
      <clipPath id="${clipId}">
        <rect x="${String(x)}" y="${String(y)}" width="${String(tileSize)}" height="${String(tileSize)}" rx="${String(radius)}" ry="${String(radius)}"/>
      </clipPath>
    </defs>
    <g>
      <rect x="${String(x)}" y="${String(y)}" width="${String(tileSize)}" height="${String(tileSize)}" rx="${String(radius)}" ry="${String(radius)}" fill="#0f172a" stroke="${color}" stroke-width="${String(clamp(tileSize * 0.014, 2, 4))}"/>
      <rect x="${String(x)}" y="${String(y)}" width="${String(tileSize)}" height="${String(tileSize)}" rx="${String(radius)}" ry="${String(radius)}" fill="none" stroke="${color}" stroke-opacity="0.24" stroke-width="${String(clamp(tileSize * 0.04, 5, 10))}" filter="url(#softGlow)"/>
      <image href="${shipImage}" x="${String(x)}" y="${String(y)}" width="${String(tileSize)}" height="${String(tileSize)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>
      <rect x="${String(x)}" y="${String(y + tileSize - footerHeight)}" width="${String(tileSize)}" height="${String(footerHeight)}" fill="url(#infoRailFade)" clip-path="url(#${clipId})"/>
      ${ship.saved ? `
        <rect x="${String(x + badgePad)}" y="${String(y + badgePad)}" width="${String(savedWidth)}" height="${String(chipHeight)}" rx="${String(chipHeight / 2)}" fill="#22d3ee"/>
        <text x="${String(x + badgePad + savedWidth / 2)}" y="${String(y + badgePad + chipHeight / 2)}" fill="#000000" font-size="${String(chipFontSize)}" font-family="Arial, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">SAVED</text>
      ` : ""}
      ${ship.owned ? `
        <rect x="${String(x + badgePad + (ship.saved ? savedWidth + chipGap : 0))}" y="${String(y + badgePad)}" width="${String(ownedWidth)}" height="${String(chipHeight)}" rx="${String(chipHeight / 2)}" fill="#facc15"/>
        <text x="${String(x + badgePad + (ship.saved ? savedWidth + chipGap : 0) + ownedWidth / 2)}" y="${String(y + badgePad + chipHeight / 2)}" fill="#000000" font-size="${String(chipFontSize)}" font-family="Arial, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">OWNED</text>
      ` : ""}
      ${sourceLabel === "" ? "" : `
        <rect x="${String(x + badgePad)}" y="${String(sourceY)}" width="${String(sourceWidth)}" height="${String(sourceHeight)}" rx="${String(sourceHeight / 2)}" fill="${sourceFill}"/>
        <text x="${String(x + badgePad + sourceWidth / 2)}" y="${String(sourceY + sourceHeight / 2)}" fill="#ffffff" font-size="${String(sourceFontSize)}" font-family="Arial, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">${sourceLabel}</text>
      `}
      <rect x="${String(x + tileSize - badgeWidth - badgePad)}" y="${String(y + badgePad)}" width="${String(badgeWidth)}" height="${String(badgeHeight)}" rx="${String(badgeHeight / 2)}" fill="${color}"/>
      <text x="${String(x + tileSize - badgeWidth / 2 - badgePad)}" y="${String(y + badgePad + badgeHeight / 2)}" fill="#ffffff" font-size="${String(badgeFontSize)}" font-family="Arial, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">${playerCount}P</text>
      <text x="${String(x + badgePad)}" y="${String(y + tileSize - footerHeight + footerHeight * 0.38)}" fill="#ffffff" font-size="${String(nameFontSize)}" font-family="Arial, sans-serif" font-weight="900" text-anchor="start" dominant-baseline="middle">${teamName}</text>
      <text x="${String(x + badgePad)}" y="${String(y + tileSize - footerHeight + footerHeight * 0.72)}" fill="#cbd5e1" font-size="${String(metaFontSize)}" font-family="Arial, sans-serif" font-weight="700" text-anchor="start" dominant-baseline="middle">#${shipId} • ${hexCode}</text>
    </g>
  `.trim();
};
const drawShipWallSvg = (shipInput: DrawShipInput, title = "Ship List", description = "Crowded view of the current fleet.", imageMap = new Map<string, string>()): string => {
  const ships = Array.isArray(shipInput) ? shipInput : normalizeShips(shipInput);
  const shipCount = Math.max(ships.length, 1);
  const layout = getLayout(shipCount);
  const headerHeight = clamp(layout.tileSize * 0.48, 92, 128);
  const stepX = layout.tileSize + layout.colGap;
  const stepY = layout.tileSize + layout.rowGap;
  const rows = Math.ceil(shipCount / layout.cols);
  const contentHeight = rows * stepY - layout.rowGap;
  const height = Math.ceil(layout.paddingTop + headerHeight + contentHeight + layout.paddingBottom);
  const baseX = (layout.width - (layout.cols * layout.tileSize + (layout.cols - 1) * layout.colGap)) / 2;
  const baseY = layout.paddingTop + headerHeight;
  const shipCells = ships.map((ship, index) => {
    const row = Math.floor(index / layout.cols);
    const col = index % layout.cols;
    const x = baseX + col * stepX;
    const y = baseY + row * stepY;
    return drawShipCellSvg(ship, index, x, y, layout.tileSize, imageMap);
  }).join("\n");

  return `
    <svg width="${String(layout.width)}" height="${String(height)}" viewBox="0 0 ${String(layout.width)} ${String(height)}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0b1220"/>
          <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
        <linearGradient id="infoRailFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00000000"/>
          <stop offset="100%" stop-color="#000000DD"/>
        </linearGradient>
        <filter id="cardShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.28"/>
        </filter>
        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#ffffff" flood-opacity="0.08"/>
        </filter>
      </defs>
      <rect width="${String(layout.width)}" height="${String(height)}" fill="url(#bgGradient)"/>
      <text x="${String(layout.paddingX)}" y="${String(layout.paddingTop + 32)}" fill="#ffffff" font-size="30" font-family="Arial, sans-serif" font-weight="900" text-anchor="start">${escapeXml(title)}</text>
      <text x="${String(layout.paddingX)}" y="${String(layout.paddingTop + 58)}" fill="#cbd5e1" font-size="13" font-family="Arial, sans-serif" font-weight="700" text-anchor="start">${escapeXml(description)}</text>
      <g filter="url(#cardShadow)">
        ${shipCells}
      </g>
    </svg>
  `.trim();
};
const drawShipWallPng = async (shipInput: DrawShipInput, title: string, description: string): Promise<Buffer> => {
  const ships = Array.isArray(shipInput) ? shipInput : normalizeShips(shipInput);
  const imageMap = await resolveShipImages(ships);
  const svg = drawShipWallSvg(ships, title, description, imageMap);
  return sharp(Buffer.from(svg)).png().toBuffer();
};
const mergeShipLists = (persistedShipList: PublicShipList, ephemeralShipList: PublicShipList): DrawShip[] => [
    ...normalizeShips(persistedShipList, "persisted"),
    ...normalizeShips(ephemeralShipList, "ephemeral")
  ];
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = response.headers.get("content-type") ?? "image/png";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return "data:image/png;base64,";
  }
};
const resolveShipImages = async (ships: DrawShip[]): Promise<Map<string, string>> => {
  const urls = [...new Set(ships.map((s: DrawShip): string => s.icon_path).filter((v): v is string => v !== ""))];
  const entries = await Promise.all(
    urls.map(async (url: string): Promise<readonly [string, string]> => [url, await fetchImageAsBase64(url)] as const)
  );
  return new Map(entries);
};

export {
  drawShipWallSvg,
  drawShipWallPng,
  mergeShipLists
};
