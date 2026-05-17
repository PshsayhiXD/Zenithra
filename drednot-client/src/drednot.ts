import { setConfig } from "@DClient/config.js";
import { promptForInterstellar } from "@DClient/runtime/interstellar.js";
import { ZenithraBot } from "@DClient/bot.js";

export { setConfig };

promptForInterstellar();

const app = new ZenithraBot();

// eslint-disable-next-line unicorn/prefer-top-level-await
void app.start().catch((error: unknown) => {
  console.error("[ZenithraBot]", error);
});

export { app as zenithraBot };
