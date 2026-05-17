import type { IncomingMessage, ServerResponse } from "node:http";
import type { CommandReplyContent } from "@commands/types/command.js";
import { sendJson } from "@backend/utils/http.js";
import { readJsonBody } from "@backend/utils/body.js";
import { listCommands, getCommand, parseCommand } from "@backend/services/command.service.js";
import { findLegacyCommand } from "@commands/catalog.js";

export const getCommands = (response: ServerResponse): void => {
  sendJson(response, 200, {
    commands: listCommands(),
  });
};

export const getCommandByName = (name: string, response: ServerResponse): void => {
  if (name === "parse" || name === "execute" || name.length === 0) {
    sendJson(response, 404, { error: "Route not found." });
    return;
  }

  const command = getCommand(name);
  if (command === undefined) {
    sendJson(response, 404, {
      error: `Unknown command: ${name}`,
    });
    return;
  }

  sendJson(response, 200, { command });
};

export const parseCommandRequest = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const input = typeof body?.["input"] === "string" ? body["input"] : "";

    if (input.trim().length === 0) {
      sendJson(response, 400, {
        error: "Missing required string field: input",
      });
      return;
    }

    const parsed = parseCommand(input);
    if (parsed === undefined) {
      sendJson(response, 404, {
        error: "No matching command found.",
      });
      return;
    }

    sendJson(response, 200, parsed);
  } catch (error: unknown) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const executeCommandRequest = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const userId = typeof body?.["userId"] === "string" ? body["userId"] : "0";
    const username = typeof body?.["username"] === "string" ? body["username"] : "HTTP_User";
    const input = typeof body?.["input"] === "string" ? body["input"] : "";

    if (input.trim().length === 0) {
      sendJson(response, 400, { error: "Missing required string field: input" });
      return;
    }

    const parsed = parseCommand(input);
    if (parsed === undefined) {
      sendJson(response, 404, { error: "No matching command found." });
      return;
    }

    const cmd = findLegacyCommand(parsed.name);

    if (cmd === undefined) {
      sendJson(response, 404, { error: "Command not found." });
      return;
    }

    const { getDeps } = await import("@dependencies");
    const deps = getDeps(cmd.dependencies);

    const replies: unknown[] = [];

    const result = await cmd.execute({
      platform: "drednot",
      isDiscord: false,
      isDrednot: true,
      userId,
      username,
      userAvatarUrl: "",
      guildId: null,
      args: parsed.arguments,
      name: parsed.name,
      raw: input,
      deps,
      cmd,
      responses: replies as CommandReplyContent[],
    });

    sendJson(response, 200, {
      result,
      replies,
      deprecated: {
        disableHttp: "Use context.isDiscord/context.isDrednot inside commands instead.",
      },
    });

  } catch (error: unknown) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
