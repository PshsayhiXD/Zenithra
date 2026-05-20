import { setConfig } from "@DClient/config.js";
import { startApp } from "@DClient/app/bootstrap.js";
import { promptForInterstellar } from "@DClient/runtime/interstellar.js";

export { setConfig };

promptForInterstellar();

// eslint-disable-next-line unicorn/prefer-top-level-await
void startApp().catch((error: unknown): void => {
  console.error("[ZenithraBot]", error);
});
