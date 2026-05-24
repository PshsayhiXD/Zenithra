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
  UserSelectMenuBuilder,
  ButtonStyle,
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

export interface ButtonDto {
  id: string;
  label?: string;
  emoji?: string;
  style: ButtonStyle;
}

export interface SectionDto {
  text: string;
  button?: ButtonDto;
}

export type ContainerComponentDto = SectionDto;

export interface CreateContainerOptions {
  accentColor?: number | string;
  id?: string | number;
  components?: ContainerComponentDto[];
  autoSeparators?: boolean;
}
