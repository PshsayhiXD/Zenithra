import { setConfig } from "@DClient/config.js";
import { startApp } from "@DClient/app/bootstrap.js";
import { promptForInterstellar } from "@DClient/runtime/interstellar.js";

export { setConfig };

promptForInterstellar();

void startApp().catch((error: unknown): void => {
  console.error("[ZenithraBot]", error);
});
