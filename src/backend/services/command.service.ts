import type { CommandReplyContent, CommandResult } from "@commands/types/command.js";
import type { ExecuteCommandResponse } from "@backend/types/command.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  listLegacyCommandSummaries,
  getLegacyCommandSummary,
  parseLegacyCommandInput,
  findLegacyCommand,
  type CommandSummary,
  type ParsedCommandRequest,
} from "@commands/catalog.js";
import { resolveUserIdentity } from "@backend/controllers/chat.controller.js";
import { getRemainingCooldown, setCooldown } from "@tables/cooldown/index.js";
import { upsertUser } from "@tables/user/index.js";
import { code } from "@dependencies";
import { sendJson } from "@backend/utils/response.js";
import { readJsonBody } from "@backend/utils/body.js";

export interface ExecuteCommandInput {
  input: string;
  userId?: string;
  username?: string;
}

export interface ExecuteCommandResult {
  status: number;
  payload: ExecuteCommandResponse;
}

export interface ParseCommandInput {
  input: string;
}

export interface ParseCommandResult {
  status: number;
  payload?: ParsedCommandRequest;
  error?: string;
}

export const listCommands = (): CommandSummary[] => listLegacyCommandSummaries();

export const getCommand = (name: string): CommandSummary | undefined => getLegacyCommandSummary(name);

export const parseCommand = (input: string): ParsedCommandRequest | undefined => parseLegacyCommandInput(input);

const normalizeInput = (input: string): string => {
  const trimmed = input.trim();
  if (trimmed.startsWith("!") || trimmed.startsWith("/")) return trimmed.slice(1).trim();
  return trimmed;
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

export const parseCommandRequest = (options: ParseCommandInput): ParseCommandResult => {
  try {
    const { input } = options;
    const commandInput = normalizeInput(input);
    const parsed = parseCommand(commandInput);
    if (parsed === undefined) return { status: 404, error: "No matching command found." };
    return { status: 200, payload: parsed };
  } catch (error: unknown) {
    return { status: 400, error: error instanceof Error ? error.message : String(error) };
  }
};

export const executeCommand = async (options: ExecuteCommandInput): Promise<ExecuteCommandResult> => {
  const { input, userId, username } = options;
  const identity = resolveUserIdentity(username, userId);
  upsertUser(identity.userId);
  const commandInput = normalizeInput(input);
  const parsed = parseCommand(commandInput);
  if (parsed === undefined) {
    return {
      status: 404,
      payload: { result: code.InternalError, replies: ["No matching command found."] },
    };
  }

  const cmd = findLegacyCommand(parsed.name);
  if (cmd === undefined) {
    return {
      status: 404,
      payload: { result: code.InternalError, replies: ["Command not found."] },
    };
  }
  const replies: CommandReplyContent[] = [];
  if (cmd.cooldown && cmd.cooldown > 0) {
    const remaining = getRemainingCooldown(identity.userId, cmd.name);
    if (remaining > 0) {
      const seconds = (remaining / 1000).toFixed(1);
      replies.push(`Please wait **${seconds}s** before using \`${cmd.name}\` again.`);
      return {
        status: 200,
        payload: { result: code.Warning, replies },
      };
    }
    setCooldown(identity.userId, cmd.name, cmd.cooldown * 1000);
  }
  if (cmd.args.length > 0) {
    const missingArguments = cmd.args.filter(
      (argument, index) => argument.required && parsed.arguments[index] === undefined,
    );
    if (missingArguments.length > 0) {
      replies.push(formatMissingArguments(cmd, parsed.arguments));
      return {
        status: 200,
        payload: { result: code.Warning, replies },
      };
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
    flags: parsed.flags,
    name: parsed.name,
    raw: commandInput,
    deps,
    cmd,
    responses: replies,
  });
  return {
    status: 200,
    payload: { result, replies },
  };
};

export const executeCommandRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const input = typeof body?.["input"] === "string" ? body["input"] : "";
    if (input.trim().length === 0) {
      sendJson(response, 400, { error: "Missing required string field: input" });
      return;
    }
    const result = await executeCommand({
      input,
      ...(typeof body?.["userId"] === "string" ? { userId: body["userId"] } : {}),
      ...(typeof body?.["username"] === "string" ? { username: body["username"] } : {}),
    });
    sendJson(response, result.status, result.payload);
  } catch (error: unknown) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
