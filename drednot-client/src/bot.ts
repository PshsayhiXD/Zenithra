import type { ParsedChatMessage } from "@DClient/types/chat.js";
import { getBrowserRuntime } from "@DClient/runtime/browser.js";
import { startZenithraClient, type ZenithraClient } from "@DClient/client.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const extractReplyText = (reply: unknown): string[] => {
  if (typeof reply === "string") return [reply];
  if (!isRecord(reply)) return [];
  const lines: string[] = [];
  if (typeof reply["content"] === "string" && reply["content"].length > 0) lines.push(reply["content"]);
  if (Array.isArray(reply["embeds"])) {
    for (const embed of reply["embeds"]) {
      if (!isRecord(embed)) continue;
      if (typeof embed["title"] === "string") lines.push(embed["title"]);
      if (typeof embed["description"] === "string") lines.push(embed["description"]);
      if (Array.isArray(embed["fields"])) {
        for (const field of embed["fields"]) {
          if (!isRecord(field)) continue;
          const name = typeof field["name"] === "string" ? field["name"] : "";
          const value = typeof field["value"] === "string" ? field["value"] : "";
          if (name.length > 0 || value.length > 0) lines.push(`${name}: ${value}`);
        }
      }
    }
  }
  return lines;
};

const chunkText = (text: string): string[] => {
  if (text.length <= 300) return [text];
  const chunks: string[] = [];
  let pos = 0;
  while (pos < text.length) {
    const isFirst = chunks.length === 0;
    const prefix = isFirst ? "" : "..";
    const remaining = text.slice(pos);
    const isLast = prefix.length + remaining.length <= 300;
    if (isLast) {
      chunks.push(prefix + remaining);
      break;
    }
    const suffix = "..";
    const available = 300 - prefix.length - suffix.length;
    chunks.push(prefix + text.slice(pos, pos + available) + suffix);
    pos += available;
  }
  return chunks;
};

const sendReplyToChat = (reply: unknown): void => {
  if (typeof window.StellarAPI.sendChat !== "function") return;
  const lines = extractReplyText(reply);
  for (const line of lines)
    for (const chunk of chunkText(line)) window.StellarAPI.sendChat(chunk);
};

export class ZenithraBot {
  private client: ZenithraClient | null = null;

  start = async (): Promise<void> => {
    this.client = await startZenithraClient(getBrowserRuntime(), {
      onError: (error): void => {
        console.error("[ZenithraBot]", error);
      },
    });
  };

  handleInput = async (message: ParsedChatMessage): Promise<void> => {
    if (this.client === null) throw new Error("Zenithra bot has not started.");
    const response = await this.client.sendCommand({
      input: message.message,
      userId: "unknown",
      username: message.username,
      rank: Number(message.rank) || 0,
      badges: message.badges,
    });
    for (const reply of response.replies) sendReplyToChat(reply);
  };
}
