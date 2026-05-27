import type {
  ChatInputCommandInteraction,
  PermissionResolvable,
  ApplicationCommandOptionType as OptionType,
} from "discord.js";
import type {
  DependencyKey,
  ResolvedDeps,
} from "@dependencies";
import type { CodeNumber } from "@deps/code.js";

export interface CommandPermission {
  discord?: PermissionResolvable | PermissionResolvable[];
  roles?: string | string[];
}

export interface SlashCommandStringChoice {
  name: string;
  value: string;
}

export interface SlashCommandNumberChoice {
  name: string;
  value: number;
}

export type SlashCommandOption =
  | {
      name: string;
      description: string;
      type: typeof OptionType.String;
      required?: boolean;
      choices?: SlashCommandStringChoice[];
    }
  | {
      name: string;
      description: string;
      type: typeof OptionType.Integer | typeof OptionType.Number;
      required?: boolean;
      choices?: SlashCommandNumberChoice[];
    }
  | {
      name: string;
      description: string;
      type:
        | typeof OptionType.Boolean
        | typeof OptionType.User
        | typeof OptionType.Channel
        | typeof OptionType.Role
        | typeof OptionType.Mentionable
        | typeof OptionType.Attachment;
      required?: boolean;
    };

export type SlashOptionResolver = ChatInputCommandInteraction["options"];

export type SlashCommandResult = CodeNumber | [CodeNumber, string];

export interface SlashCommandContext<T extends DependencyKey = DependencyKey> {
  interaction: ChatInputCommandInteraction;
  options: SlashOptionResolver;
  args: string[];
  name: string;
  raw: string;
  deps: ResolvedDeps<T>;
  cmd: SlashCommand<T>;
}

export interface BaseSlashCommand<T extends DependencyKey = DependencyKey> {
  name: string;
  id: number;
  category: string;
  description?: string;
  aliases?: string[];
  cooldown?: number;
  permission?: CommandPermission;
  args?: SlashCommandOption[];
  dependencies?: T[];
  execute: (context: SlashCommandContext<T>) => Promise<SlashCommandResult>;
}

export interface GlobalSlashCommand<
  T extends DependencyKey = DependencyKey,
> extends BaseSlashCommand<T> {
  shouldRegister: boolean;
  dmPermission?: boolean;
  groupPermission?: boolean;
}

export interface GuildSlashCommand<
  T extends DependencyKey = DependencyKey,
> extends BaseSlashCommand<T> {
  guildId?: string;
}

export type SlashCommand<T extends DependencyKey = DependencyKey> =
  | GlobalSlashCommand<T>
  | GuildSlashCommand<T>;

export const defineGuildSlashCommand = <const T extends DependencyKey = DependencyKey>(
  guildSlashCommand: GuildSlashCommand<T>,
): GuildSlashCommand<T> => guildSlashCommand;

export const defineGlobalSlashCommand = <const T extends DependencyKey = DependencyKey>(
  globalSlashCommand: GlobalSlashCommand<T>,
): GlobalSlashCommand<T> => globalSlashCommand

export type { DependencyKey, ResolvedDeps };
