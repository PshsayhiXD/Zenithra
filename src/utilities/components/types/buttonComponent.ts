import type {
  ButtonStyle,
  Interaction,
} from "discord.js";

export interface InteractionButtonComponentOptions {
  label: string;
  style: Exclude<ButtonStyle, ButtonStyle.Link>;
  customId: string;
  disabled?: boolean;
  emoji?: string;
  onClick?: (interaction: Interaction) => void;
  single?: boolean;
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
