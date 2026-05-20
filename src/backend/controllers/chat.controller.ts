import type { IncomingMessage, ServerResponse } from "node:http";
import { User as UserTable } from "@tables/index.js";
import { validateUsername } from "@Rmigrations/logic/001/validation.js";
import { getDatabase } from "@databases/index.js";
import { sendJson } from "@backend/utils/http.js";
import { readJsonBody } from "@backend/utils/body.js";
import { resolvePublicBaseUrl } from "@backend/utils/config.js";
import { loadEnvironment } from "@environment";
import { findLegacyCommand, parseLegacyCommandInput } from "@commands/catalog.js";
import type { CommandReplyContent } from "@commands/types/command.js";
import type { ChatIdentityResponse, ChatMessageResponse } from "@backend/types/chat.js";

export interface ResolvedIdentity {
  userId: string;
  username: string;
  isLinked: boolean;
  platform: "discord" | "drednot";
}

export const resolveUserIdentity = (username?: string, userId?: string): ResolvedIdentity => {
  if (username !== undefined && username !== "") {
    const linkedUser = UserTable.getUserByUsername(username);
    if (linkedUser !== undefined) {
      return {
        userId: linkedUser.id,
        username,
        isLinked: true,
        platform: "discord",
      };
    }
  }

  const isDiscordId = userId !== undefined && /^\d+$/u.test(userId);
  if (userId !== undefined && isDiscordId) {
    const userRow = UserTable.getUser(userId);
    return {
      userId,
      username: userRow?.username ?? username ?? "Drednot_User",
      isLinked: userRow?.username !== null && userRow?.username !== undefined,
      platform: "discord",
    };
  }

  if (userId?.startsWith("drednot:") === true) {
    const extractedUsername = username ?? userId.split(":")[1] ?? "Drednot_User";
    return {
      userId,
      username: extractedUsername,
      isLinked: false,
      platform: "drednot",
    };
  }

  const resolvedUsername = username ?? "drednot_user";
  const uniqueId = `drednot:${resolvedUsername.toLowerCase()}`;
  return {
    userId: uniqueId,
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
      const host = request.headers.host ?? "127.0.0.1:8787";
      const url = new URL(request.url ?? "/", `http://${host}`);
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

    const validation = validateUsername(username, discordId);
    if (!validation.ok) {
      sendJson(response, 400, { error: validation.error });
      return;
    }

    const database = getDatabase();
    database.transaction((): void => {
      UserTable.upsertUser(discordId);
      UserTable.setUsername(discordId, validation.username);
    })();

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
  const host = request.headers.host ?? "127.0.0.1:8787";
  const url = new URL(request.url ?? "/", `http://${host}`);
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
    const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=identify&state=${encodeURIComponent(username)}`;

    response.writeHead(302, { Location: authorizeUrl });
    response.end();
    return;
  }
  if (typeof code === "string" && typeof state === "string") {
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

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to exchange code: ${errorText}`);
      }

      const tokenData = (await tokenResponse.json()) as { access_token: string };
      const accessToken = tokenData.access_token;

      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) throw new Error("Failed to fetch Discord profile.");

      const userData = (await userResponse.json()) as {
        id: string;
        username: string;
        discriminator: string;
      };
      const discordId = userData.id;
      const discordTag =
        userData.discriminator === "0"
          ? userData.username
          : `${userData.username}#${userData.discriminator}`;
      const drednotUsername = decodeURIComponent(state);

      const validation = validateUsername(drednotUsername, discordId);
      if (!validation.ok) {
        throw new Error(validation.error);
      }

      const database = getDatabase();
      database.transaction((): void => {
        UserTable.upsertUser(discordId);
        UserTable.setUsername(discordId, validation.username);
      })();

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(
        renderLinkHtmlPage(
          "Link Successful!",
          `Successfully linked Drednot username <strong>${validation.username}</strong> to Discord account <strong>@${discordTag}</strong>! You can now close this tab.`,
          true
        )
      );
      return;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(
        renderLinkHtmlPage(
          "Link Failed",
          `Failed to complete account linking: ${errorMessage}. <br/><br/>If you want, you can use the direct linkage form below or retry the Discord OAuth2.`,
          false,
          state
        )
      );
      return;
    }
  }

  response.writeHead(200, { "Content-Type": "text/html" });
  response.end(
    renderLinkHtmlPage(
      "Account Linking",
      "Enter your Drednot username below to start the Discord linking process.",
      null
    )
  );
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

    if (identity.isLinked) {
      payload.discordId = identity.userId;
    }

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
          const { getDeps } = await import("@dependencies");
          const deps = getDeps(cmd.dependencies);
          const replies: unknown[] = [];

          const result = await cmd.execute({
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
            responses: replies as CommandReplyContent[],
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

const renderLinkHtmlPage = (
  title: string,
  message: string,
  success: boolean | null,
  usernameParameter?: string
): string => {
  let statusClass = "pending";
  let statusIcon = "🔗";

  if (success === true) {
    statusClass = "success";
    statusIcon = "✓";
  } else if (success === false) {
    statusClass = "error";
    statusIcon = "✗";
  }

  const directLinkSection =
    success === false && usernameParameter !== undefined
      ? `
    <div style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
      <h3 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.1rem;">Emergency Direct Link</h3>
      <p style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 1rem;">If OAuth2 is not configured on Discord, link manually using a Discord ID:</p>
      <form id="directLinkForm" style="display: flex; flex-direction: column; gap: 0.8rem; text-align: left;">
        <input type="hidden" name="username" value="${encodeURIComponent(usernameParameter)}" />
        <div>
          <label style="display: block; font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-bottom: 0.3rem;">Discord User ID</label>
          <input type="text" name="userId" placeholder="e.g. 184561234567890123" required style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; box-sizing: border-box;" />
        </div>
        <button type="submit" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 0.7rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: transform 0.2s;">Link Directly</button>
      </form>
      <div id="directLinkStatus" style="margin-top: 0.8rem; font-size: 0.85rem; display: none;"></div>
    </div>
  `
      : "";

  const initialForm =
    success === null
      ? `
    <form action="/chat/link" method="GET" style="display: flex; flex-direction: column; gap: 1rem; text-align: left; margin-top: 1.5rem;">
      <div>
        <label style="display: block; font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.4rem;">Drednot Username</label>
        <input type="text" name="username" placeholder="Enter game username" required style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; font-size: 1rem; box-sizing: border-box;" />
      </div>
      <button type="submit" style="background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%); color: white; border: none; padding: 0.9rem; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);">Link with Discord OAuth2</button>
    </form>
  `
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Zenithra</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background: radial-gradient(circle at center, #1e1b4b 0%, #0f0b29 100%);
      color: #e2e8f0;
      font-family: 'Outfit', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: hidden;
    }
    .container {
      width: 100%;
      max-width: 450px;
      margin: 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
      position: relative;
    }
    .icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      font-weight: bold;
    }
    .icon-wrapper.success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 2px solid rgba(16, 185, 129, 0.3);
    }
    .icon-wrapper.error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 2px solid rgba(239, 68, 68, 0.3);
    }
    .icon-wrapper.pending {
      background: rgba(88, 101, 242, 0.1);
      color: #5865f2;
      border: 2px solid rgba(88, 101, 242, 0.3);
    }
    h1 {
      font-size: 1.8rem;
      margin: 0 0 1rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    p {
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 1.5rem;
    }
    strong {
      color: #fff;
    }
    button:hover {
      transform: translateY(-2px);
    }
    button:active {
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon-wrapper ${statusClass}">${statusIcon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${initialForm}
    ${directLinkSection}
  </div>

  <script>
    const directForm = document.getElementById('directLinkForm');
    if (directForm) {
      directForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusDiv = document.getElementById('directLinkStatus');
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#94a3b8';
        statusDiv.textContent = 'Linking...';

        const formData = new FormData(directForm);
        const username = decodeURIComponent(formData.get('username'));
        const userId = formData.get('userId');

        try {
          const res = await fetch('/chat/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, userId })
          });
          const data = await res.json();
          if (res.ok) {
            statusDiv.style.color = '#10b981';
            statusDiv.textContent = data.message || 'Link successful!';
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            statusDiv.style.color = '#ef4444';
            statusDiv.textContent = data.error || 'Failed to link account.';
          }
        } catch (err) {
          statusDiv.style.color = '#ef4444';
          statusDiv.textContent = 'Error: ' + err.message;
        }
      });
    }
  </script>
</body>
</html>
  `;
};
