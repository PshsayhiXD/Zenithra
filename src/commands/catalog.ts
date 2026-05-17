import { commands } from "@commands/_legacyCommands.js";
import type { Command, CommandPermission } from "@commands/types/command.js";

export interface CommandSummary {
  name: string;
  id: number;
  category: string;
  description: string;
  aliases: string[];
  cooldown: number;
  args: CommandArgumentSummary[];
  dependencies: string[];
  permission: CommandPermission;
}

export interface CommandArgumentSummary {
  name: string;
  description?: string | undefined;
  type: string;
  required: boolean;
}

export interface ParsedCommandRequest {
  input: string;
  name: string;
  arguments: string[];
  command: CommandSummary;
  matchedBy: "name" | "alias";
}

const summarizeCommand = (command: Command): CommandSummary => ({
  name: command.name,
  id: command.id,
  category: command.category,
  description: command.description,
  aliases: [...command.aliases],
  cooldown: command.cooldown,
  args: command.args.map(argument => ({
    name: argument.name,
    description: argument.description,
    type: argument.type,
    required: argument.required,
  })),
  dependencies: [...command.dependencies],
  permission: command.permission,
});

export const listLegacyCommandSummaries = (): CommandSummary[] =>
  [...commands]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(command => summarizeCommand(command));

export const findLegacyCommand = (query: string): Command | undefined => {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) return undefined;
  return commands.find(
    command =>
      command.name.toLowerCase() === normalized ||
      command.aliases.some(alias => alias.toLowerCase() === normalized),
  );
};

export const parseLegacyCommandInput = (input: string): ParsedCommandRequest | undefined => {
  const trimmed = input.trim();
  if (trimmed.length === 0) return undefined;

  const parts = trimmed.split(/\s+/);
  const rawName = parts[0];
  if (rawName === undefined) return undefined;

  const command = findLegacyCommand(rawName);
  if (command === undefined) return undefined;

  return {
    input: trimmed,
    name: command.name,
    arguments: parts.slice(1),
    command: summarizeCommand(command),
    matchedBy: command.name.toLowerCase() === rawName.toLowerCase() ? "name" : "alias",
  };
};

export const getLegacyCommandSummary = (query: string): CommandSummary | undefined => {
  const command = findLegacyCommand(query);
  return command === undefined ? undefined : summarizeCommand(command);
};
