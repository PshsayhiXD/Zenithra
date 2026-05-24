import type { IncomingMessage, ServerResponse } from "node:http";
import { User as UserTable } from "@tables/index.js";
import { validateUsername } from "@Rmigrations/logic/001/validation.js";
import { getDatabase } from "@databases/index.js";
import { sendJson } from "@backend/utils/response.js";
import { readJsonBody } from "@backend/utils/body.js";
import { loadEnvironment } from "@environment";
import { BACKEND_HOST, BACKEND_PORT, resolvePublicBaseUrl } from "@backend/utils/config.js";
import { findLegacyCommand, parseLegacyCommandInput } from "@commands/catalog.js";
import { executeCommand } from "@backend/services/command.service.js";
import type { ChatIdentityResponse, ChatMessageResponse } from "@backend/types/chat.js";

export interface ResolvedIdentity {
  userId: string;
  username: string;
  isLinked: boolean;
  platform: "discord" | "drednot";
};

export const resolveUserIdentity = (username?: string, userId?: string): ResolvedIdentity => {
  const isDiscordId = typeof userId === "string" && /^\d{17,20}$/u.test(userId);
  if (isDiscordId) {
    const userRow = UserTable.getUser(userId);
    return {
      userId,
      username: userRow?.username ?? username ?? "Drednot_User",
      isLinked: userRow?.username !== null && userRow?.username !== undefined,
      platform: "discord",
    };
  }
  if (typeof userId === "string" && userId.startsWith("drednot:")) {
    const extractedUsername = username ?? "Drednot_User";
    return {
      userId,
      username: extractedUsername,
      isLinked: false,
      platform: "drednot",
    };
  }
  const resolvedUsername = username ?? "drednot_user";
  return {
    userId: "drednot:anonymous",
    username: resolvedUsername,
    isLinked: false,
    platform: "drednot",
  };
};

export const identityRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  try {
    let username: string | undefined;
    let userId: string | undefined;
    if (request.method === "POST") {
      const body = await readJsonBody(request);
      username = typeof body?.["username"] === "string" ? body["username"] : undefined;
      userId = typeof body?.["userId"] === "string" ? body["userId"] : undefined;
    } else {
      const host = request.headers.host ?? `${BACKEND_HOST}:${String(BACKEND_PORT)}`;
      const url = new URL(request.url ?? "/", `https://${host}`);
      username = url.searchParams.get("username") ?? undefined;
      userId = url.searchParams.get("userId") ?? undefined;
    }
    if (username === undefined && userId === undefined) {
      sendJson(response, 400, { error: "Missing required parameter: username or userId" });
      return;
    }
    const resolved = resolveUserIdentity(username, userId);
    const payload: ChatIdentityResponse = {
      userId: resolved.userId,
      username: resolved.username,
      isLinked: resolved.isLinked,
      platform: resolved.platform,
    };
    sendJson(response, 200, payload);
  } catch (error: unknown) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const linkRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const discordId = typeof body?.["userId"] === "string" ? body["userId"] : undefined;
    const username = typeof body?.["username"] === "string" ? body["username"] : undefined;

    if (discordId === undefined || username === undefined) {
      sendJson(response, 400, { error: "Missing required fields: userId, username" });
      return;
    }
    const isValidDiscordId = /^\d{17,20}$/u.test(discordId);
    if (!isValidDiscordId) {
      sendJson(response, 400, { error: "Invalid Discord ID format" });
      return;
    }
    const validation = validateUsername(username, discordId);
    if (!validation.ok) {
      sendJson(response, 400, { error: validation.error });
      return;
    }
    const database = getDatabase();
    database.transaction(() => {
      const user = UserTable.getUser(discordId);
      if (!user) throw new Error("User does not exist (must be created via OAuth)");
      if (user.username !== null) throw new Error("Discord account already linked");
      const existingOwner = UserTable.getUserByUsername(validation.username);
      if (existingOwner && existingOwner.id !== discordId) throw new Error("Username already taken");
      UserTable.setUsername(discordId, validation.username);
    });
    sendJson(response, 200, {
      success: true,
      userId: discordId,
      username: validation.username,
      message: `Successfully linked Drednot username '${validation.username}' to Discord ID '${discordId}'`,
    });
  } catch (error: unknown) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const linkOAuthRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  const host = request.headers.host ?? `${BACKEND_HOST}:${String(BACKEND_PORT)}`;
  const url = new URL(request.url ?? "/", `https://${host}`);
  const username = url.searchParams.get("username") ?? undefined;
  const code = url.searchParams.get("code") ?? undefined;
  const state = url.searchParams.get("state") ?? undefined;
  const environment = loadEnvironment();
  const botToken = typeof environment["DISCORD_BOT_TOKEN"] === "string" ? environment["DISCORD_BOT_TOKEN"] : "";
  const clientSecret =
    typeof environment["DISCORD_BOT_CLIENT_SECRET"] === "string" ? environment["DISCORD_BOT_CLIENT_SECRET"] : "";
  let clientId = "";
  try {
    const tokenParts = botToken.split(".");
    clientId = Buffer.from(tokenParts[0] ?? "", "base64").toString("utf8");
  } catch { void 0; }
  if (typeof username === "string" && code === undefined) {
    const redirectUri = `${resolvePublicBaseUrl(request)}/chat/link`;
    const authorizeUrl =
      `https://discord.com/api/oauth2/authorize?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&response_type=code&scope=identify" +
      `&state=${encodeURIComponent(username)}`;
    response.writeHead(302, { Location: authorizeUrl });
    response.end();
    return;
  }
  if (typeof code === "string") {
    try {
      const redirectUri = `${resolvePublicBaseUrl(request)}/chat/link`;
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      if (!tokenResponse.ok)
        throw new Error("Token exchange failed");
      const tokenData = (await tokenResponse.json()) as {
        access_token: string;
      };
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      if (!userResponse.ok)
        throw new Error("Failed to fetch Discord profile");
      const userData = (await userResponse.json()) as {
        id: string;
        username: string;
      };
      const discordId = userData.id;
      if (state === undefined)
        throw new Error("Missing username state");
      const validation = validateUsername(state, discordId);
      if (!validation.ok)
        throw new Error(validation.error);
      const database = getDatabase();
      database.transaction(() => {
        const existingOwner = UserTable.getUserByUsername(validation.username);
        if (existingOwner && existingOwner.id !== discordId)
          throw new Error("Username already taken");
        const existingUser = UserTable.getUser(discordId);
        if ((existingUser?.username) !== undefined)
          throw new Error("Discord account already linked");
        UserTable.upsertUser(discordId);
        UserTable.setUsername(discordId, validation.username);
      });
      const successUrl = new URL(`${resolvePublicBaseUrl(request)}/chat/link/success`);
      successUrl.searchParams.set("success", "true");
      successUrl.searchParams.set("message", "Account Linked!");
      response.writeHead(302, {
        Location: successUrl.toString(),
      });
      response.end();
      return;
    } catch (error: unknown) {
      const errorUrl = new URL(`${resolvePublicBaseUrl(request)}/chat/link/success`);
      errorUrl.searchParams.set("success", "false");
      errorUrl.searchParams.set("message", "Linking Failed");
      errorUrl.searchParams.set("details", error instanceof Error ? error.message : String(error));
      response.writeHead(302, { Location: errorUrl.toString() });
      response.end();
      return;
    }
  }
  const formUrl = new URL(`${resolvePublicBaseUrl(request)}/chat/link`);
  if (username !== undefined) formUrl.searchParams.set("username", username);
  response.writeHead(302, { Location: formUrl.toString() });
  response.end();
};

export const chatMessageRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> => {
  try {
    const body = await readJsonBody(request);
    const username = typeof body?.["username"] === "string" ? body["username"] : undefined;
    const message = typeof body?.["message"] === "string" ? body["message"] : undefined;
    const userId = typeof body?.["userId"] === "string" ? body["userId"] : undefined;
    if (username === undefined || message === undefined) {
      sendJson(response, 400, { error: "Missing required fields: username, message" });
      return;
    }
    const identity = resolveUserIdentity(username, userId);
    const payload: ChatMessageResponse = {
      username: identity.username,
      message,
      userId: identity.userId,
      isLinked: identity.isLinked,
    };
    if (identity.isLinked) payload.discordId = identity.userId;
    const trimmedMessage = message.trim();
    const isCommand = trimmedMessage.startsWith("!") || trimmedMessage.startsWith("/");
    if (isCommand) {
      const commandInput = trimmedMessage.slice(1).trim();
      const parsed = parseLegacyCommandInput(commandInput);
      if (parsed !== undefined) {
        payload.command = {
          name: parsed.name,
          arguments: parsed.arguments,
          raw: message,
        };
        const cmd = findLegacyCommand(parsed.name);
        if (cmd !== undefined) {
          const replies: unknown[] = [];
          const result = await executeCommand({
            input: commandInput,
            userId: identity.userId,
            username: identity.username,
          });
          payload.execution = {
            result,
            replies,
          };
        }
      }
    }
    sendJson(response, 200, payload);
  } catch (error: unknown) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
