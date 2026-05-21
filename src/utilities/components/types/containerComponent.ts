import type {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  UserSelectMenuBuilder
} from "discord.js";

export type AnyContainerComponent =
  | ButtonBuilder
  | StringSelectMenuBuilder
  | UserSelectMenuBuilder
  | RoleSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ChannelSelectMenuBuilder
  | TextInputBuilder
  | TextDisplayBuilder
  | SeparatorBuilder
  | SectionBuilder
  | ActionRowBuilder;

export interface CreateContainerOptions {
  accentColor?: number | string;
  id?: string | number;
  components?: AnyContainerComponent[];
  autoSeparators?: boolean;
}
