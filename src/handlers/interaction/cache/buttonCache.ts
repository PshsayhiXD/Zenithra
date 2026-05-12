import type { ButtonInteraction, Awaitable } from "discord.js";
import { Cache } from "@utilities/cache.js";

export interface ButtonRecord {
  onClick: (interaction: ButtonInteraction) => Awaitable<void>;
  options?: {
    /** Remove the record after the first successful invocation. */
    single?: boolean;
  };
}

export const buttonCache = new Cache<ButtonRecord>("button", "memory");
