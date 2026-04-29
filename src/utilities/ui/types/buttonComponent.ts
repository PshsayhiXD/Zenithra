import type { ButtonStyle, Interaction } from "discord.js";

export interface ButtonComponentOptions {
  label: string;
  style: ButtonStyle;
  customId: string;
  disabled?: boolean;
  emoji?: string;
  url?: string;
  onClick?: (interaction: Interaction) => void;
  single?: boolean;
}