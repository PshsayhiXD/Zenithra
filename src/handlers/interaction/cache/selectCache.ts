import type { StringSelectMenuInteraction, Awaitable } from "discord.js";
import { Cache } from "@utilities/cache.js";

export interface SelectRecord {
  onSelect: (interaction: StringSelectMenuInteraction) => Awaitable<void>;
  options?: {
    /** Remove the record after the first successful invocation. */
    single?: boolean;
  };
}

export const selectCache = new Cache<SelectRecord>("select", "memory");
