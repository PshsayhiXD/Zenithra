import { hasInterstellar } from "@DClient/runtime/browser.js";

export const promptForInterstellar = (): void => {
  if (hasInterstellar()) return;

  // eslint-disable-next-line no-alert
  const shouldJoin = confirm(
    [
      "It looks like you didn't install Interstellar.",
      "Zenithra Client requires Interstellar API to run properly.",
      "Press OK to join the Interstellar Discord server.",
      "Interstellar is not part of Zenithra.",
      "Zenithra Client is a client for Drednot, and Interstellar is the API used by Zenithra.",
    ].join("\n"),
  );

  if (shouldJoin) window.open("https://discord.gg/RudT9ZTaFA", "_blank");
};
