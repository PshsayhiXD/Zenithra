import type { ParsedChatMessage } from "@DClient/types/chat.js";
import type { ExecuteCommandResponse, ParsedCommandResponse, ChatCommandContext } from "@DClient/types/command.js";
import { getBrowserRuntime } from "@DClient/runtime/browser.js";
import { startZenithraClient, type ZenithraClient } from "@DClient/client.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const extractReplyText = (reply: unknown): string[] => {
  if (typeof reply === "string") return [reply];
  if (!isRecord(reply)) return [];

  const lines: string[] = [];

  if (typeof reply["content"] === "string" && reply["content"].length > 0) {
    lines.push(reply["content"]);
  }

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

const sendReplyToChat = (reply: unknown): void => {
  if (typeof window.StellarAPI.sendChat !== "function") return;
  const lines = extractReplyText(reply);
  for (const line of lines) window.StellarAPI.sendChat(line);
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

  handleChatMessage = async (message: ParsedChatMessage): Promise<void> => {
    const parsed = await this.parseChatCommand(message.message);
    if (parsed.name === "") return;
    const response = await this.executeChatCommand({
      input: message.message,
      username: message.username,
      userId: "unknown",
    });
    for (const reply of response.replies) sendReplyToChat(reply);
  };

  parseChatCommand = (input: string): Promise<ParsedCommandResponse> => {
    if (this.client === null) throw new Error("Zenithra bot has not started.");
    return this.client.parseCommand(input);
  };

  executeChatCommand = (context: ChatCommandContext): Promise<ExecuteCommandResponse> => {
    if (this.client === null) throw new Error("Zenithra bot has not started.");
    return this.client.executeCommand({
      input: context.input,
      username: context.username,
      userId: context.userId,
    });
  };
}

