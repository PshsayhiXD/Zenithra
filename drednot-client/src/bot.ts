import type { ExecuteCommandResponse, ParsedCommandResponse } from "@DClient/types/command.js";
import { getBrowserRuntime } from "@DClient/runtime/browser.js";
import { startZenithraClient, type ZenithraClient } from "@DClient/client.js";

export interface ChatCommandContext {
  input: string;
  username: string;
  userId: string;
}

export class ZenithraBot {
  private client: ZenithraClient | null = null;

  start = async (): Promise<void> => {
    this.client = await startZenithraClient(getBrowserRuntime(), {
      onError: (error) => {
        console.error("[ZenithraBot]", error);
      },
    });
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
