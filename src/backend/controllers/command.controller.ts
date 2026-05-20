import type { IncomingMessage, ServerResponse } from "node:http";
import type { CommandReplyContent, CommandResult } from "@commands/types/command.js";
import { sendJson } from "@backend/utils/http.js";
import { readJsonBody } from "@backend/utils/body.js";
import { listCommands, getCommand, parseCommand } from "@backend/services/command.service.js";
import { findLegacyCommand } from "@commands/catalog.js";
import { resolveUserIdentity } from "./chat.controller.js";
import { code } from "@dependencies";
import { getRemainingCooldown, setCooldown } from "@tables/cooldown/index.js";
import { upsertUser } from "@tables/user/index.js";
import type { ParsedCommandResponse, ExecuteCommandResponse } from "@backend/types/command.js";

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

export const parseCommandRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const input = typeof body?.["input"] === "string" ? body["input"] : "";

    if (input.trim().length === 0) {
      sendJson(response, 400, {
        error: "Missing required string field: input",
      });
      return;
    }

    let normalizedInput = input.trim();
    if (normalizedInput.startsWith("!") || normalizedInput.startsWith("/")) normalizedInput = normalizedInput.slice(1).trim();

    const parsed = parseCommand(normalizedInput);
    if (parsed === undefined) {
      sendJson(response, 404, {
        error: "No matching command found.",
      });
      return;
    }

    const payload: ParsedCommandResponse = {
      name: parsed.name,
      arguments: parsed.arguments,
      raw: input,
    };

    sendJson(response, 200, payload);
  } catch (error: unknown) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const formatMissingArguments = (
  cmd: { args: { name: string; description?: string; type: string; required: boolean }[]; name: string },
  arguments_: string[],
): string => {
  const usage = cmd.args
    .map((argument) => (argument.required ? `<${argument.name}>` : `[${argument.name}]`))
    .join(" ");

  const typeList = cmd.args.map((argument) => argument.type).join(", ");
  const missingArguments = cmd.args
    .filter((argument, index) => argument.required && arguments_[index] === undefined)
    .map((argument) => argument.name);

  return `Usage: \`${cmd.name} ${usage}\`\nType: \`${typeList}\`\nMissing: ${missingArguments.join(", ")}`;
};

export const executeCommandRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const userId = typeof body?.["userId"] === "string" ? body["userId"] : undefined;
    const username = typeof body?.["username"] === "string" ? body["username"] : undefined;
    const input = typeof body?.["input"] === "string" ? body["input"] : "";

    if (input.trim().length === 0) {
      sendJson(response, 400, { error: "Missing required string field: input" });
      return;
    }

    const identity = resolveUserIdentity(username, userId);
    upsertUser(identity.userId);

    let commandInput = input.trim();
    if (commandInput.startsWith("!") || commandInput.startsWith("/")) commandInput = commandInput.slice(1).trim();

    const parsed = parseCommand(commandInput);
    if (parsed === undefined) {
      sendJson(response, 404, { error: "No matching command found." });
      return;
    }

    const cmd = findLegacyCommand(parsed.name);
    if (cmd === undefined) {
      sendJson(response, 404, { error: "Command not found." });
      return;
    }

    const replies: CommandReplyContent[] = [];

    if (cmd.cooldown && cmd.cooldown > 0) {
      const remaining = getRemainingCooldown(identity.userId, cmd.name);
      if (remaining > 0) {
        const seconds = (remaining / 1000).toFixed(1);
        replies.push(`Please wait **${seconds}s** before using \`${cmd.name}\` again.`);
        const payload: ExecuteCommandResponse = { result: code.Warning, replies };
        sendJson(response, 200, payload);
        return;
      }
      setCooldown(identity.userId, cmd.name, cmd.cooldown * 1000);
    }

    if (cmd.args.length > 0) {
      const missingArguments = cmd.args.filter(
        (argument, index) => argument.required && parsed.arguments[index] === undefined,
      );
      if (missingArguments.length > 0) {
        replies.push(formatMissingArguments(cmd, parsed.arguments));
        const payload: ExecuteCommandResponse = { result: code.Warning, replies };
        sendJson(response, 200, payload);
        return;
      }
    }

    const { getDeps } = await import("@dependencies");
    const deps = getDeps(cmd.dependencies);
    const result: CommandResult = await cmd.execute({
      platform: identity.platform,
      isDiscord: identity.platform === "discord",
      isDrednot: identity.platform === "drednot",
      userId: identity.userId,
      username: identity.username,
      userAvatarUrl: "",
      guildId: null,
      args: parsed.arguments,
      name: parsed.name,
      raw: commandInput,
      deps,
      cmd,
      responses: replies,
    });

    const payload: ExecuteCommandResponse = {
      result,
      replies,
    };

    sendJson(response, 200, payload);
  } catch (error: unknown) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
