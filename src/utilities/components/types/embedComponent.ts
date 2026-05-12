import type { ColorResolvable, Interaction, Message } from "discord.js";

export interface CreateEmbedOptions {
  title?: string;
  description?: string;
  footer?: {
    text: string;
    iconURL?: string;
  };
  image?: string;
  thumbnail?: string;
  color?: ColorResolvable;
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  options?: {
    message?: Message;
    interaction?: Interaction;
    keepEmpty?: boolean;
    timestamp?: Date;
  };
}