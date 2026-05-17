import type {
  Message,
  MessagePayload,
  MessageCreateOptions,
  PermissionResolvable,
} from "discord.js";
import type {
  CommandDependencies,
  DependencyKey,
  ResolvedDeps,
  CodeNumber,
} from "@dependencies";

export { CodeNumber };

export interface CommandPermission {
  discord?: PermissionResolvable | PermissionResolvable[];
  roles?: string | string[];
}

export type CommandResult = CodeNumber | [number, string];
export type CommandReplyContent = string | MessagePayload | MessageCreateOptions;

export interface CommandContext<T extends DependencyKey = DependencyKey> {
  platform: "discord" | "drednot";
  isDiscord: boolean;
  isDrednot: boolean;
  userId: string;
  username: string;
  userAvatarUrl: string;
  guildId: string | null;
  args: string[];
  name: string;
  raw: string;
  deps: ResolvedDeps<T>;
  cmd: Command<T>;
  message?: Message;
  responses?: CommandReplyContent[];
}

export interface Command<T extends DependencyKey = DependencyKey> {
  name: string;
  id: number;
  category: string;
  description: string;
  aliases: string[];
  cooldown: number;
  permission: CommandPermission;
  /** @deprecated Prefer branching inside execute() with context.isDiscord/context.isDrednot. */
  disableHttp?: boolean;
  args: {
    name: string;
    description?: string;
    type: string;
    required: boolean;
  }[];
  dependencies: T[];
  execute: (context: CommandContext<T>) => Promise<CommandResult>;
}

export type StaticDependencies = Omit<CommandDependencies, "message">;

export type { DependencyKey, ResolvedDeps };
