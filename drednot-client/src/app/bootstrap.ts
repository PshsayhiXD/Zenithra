import { ZenithraBot } from "@DClient/bot.js";
import { chatHtmlParser } from "@DClient/chat/chatHtmlParser.js";
import { getConfig } from "@DClient/config.js";
import { playersChatListener } from "@DClient/chat/chatListener.js";

export const startApp = async (): Promise<ZenithraBot> => {
  const bot = new ZenithraBot();
  await bot.start();

  const config = getConfig();

  playersChatListener((html: string): void => {
    const parsed = chatHtmlParser(html);
    if (!parsed.message.startsWith(config.defaultPrefix)) return;
    parsed.message = parsed.message.slice(config.defaultPrefix.length);
    void bot.handleChatMessage(parsed);
  });

  return bot;
};
