import type { ParsedChatMessage } from "@DClient/types/chat.js";

export const chatHtmlParser = (html: string): ParsedChatMessage => {
  const document_ = new DOMParser().parseFromString(html, "text/html");
  const badgeElements = [...document_.querySelectorAll(".tooltip")];
  const badges = badgeElements.map((badge) => badge.textContent.trim() || "");
  const usernameElement = document_.querySelector("bdi");
  const username = usernameElement?.textContent.trim() ?? "";
  const rankMatch = document_.body.textContent.match(/\[(.*?)]/);
  const rank = rankMatch?.[1] ?? null;
  const clonedBody = document_.body.cloneNode(true) as HTMLElement;
  for (const element of clonedBody.querySelectorAll(".user-badge-small")) element.remove();
  const text = clonedBody.textContent.trim() || "";
  const message = text.split(":").slice(1).join(":").trim();
  return {
    username,
    rank,
    badges,
    message,
  };
};
