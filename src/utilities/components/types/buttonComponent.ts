import type {
  Awaitable,
  ButtonInteraction,
  ButtonStyle,
} from "discord.js";
import type { JsonValue } from "@handlers/interaction/types/persistentInteraction.js";

export interface InteractionButtonComponentOptions {
  label: string;
  style: Exclude<ButtonStyle, ButtonStyle.Link>;
  customId: string;
  disabled?: boolean;
  emoji?: string;
  onClick?: (interaction: ButtonInteraction) => Awaitable<void>;
  handlerKey?: string;
  metadata?: JsonValue;
  single?: boolean;
  persist?: boolean;
  ttlMs?: number;
};

export interface LinkButtonComponentOptions {
  label: string;
  url: string;
  disabled?: boolean;
  emoji?: string;
};

export type ButtonComponentOptions =
  | InteractionButtonComponentOptions
  | LinkButtonComponentOptions;
