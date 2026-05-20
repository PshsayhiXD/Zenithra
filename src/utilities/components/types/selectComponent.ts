import type { APISelectMenuOption } from "discord.js";
import type { JsonValue } from "@handlers/interaction/types/persistentInteraction.js";
import type { AddSelectRecordOptions } from "@handlers/interaction/types/selectInteraction.js";

export interface SelectComponentOptions {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  options: APISelectMenuOption[];
  onSelect?: AddSelectRecordOptions["onSelect"];
  handlerKey?: string;
  metadata?: JsonValue;
  single?: boolean;
  persist?: boolean;
  ttlMs?: number;
}
