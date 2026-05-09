import type { Message, PermissionResolvable } from "discord.js";
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

export interface CommandContext<T extends DependencyKey = DependencyKey> {
  message: Message;
  args: string[];
  name: string;
  raw: string;
  deps: ResolvedDeps<T>;
  cmd: Command<T>;
}

export interface Command<T extends DependencyKey = DependencyKey> {
  name: string;
  id: number;
  category: string;
  description: string;
  aliases: string[];
  cooldown: number;
  permission: CommandPermission;
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
