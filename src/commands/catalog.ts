import type { Command } from "@commands/types/command.js";
import { getLegacyCommands } from "@commands/_legacyCommands.js";
import { parseArguments } from "@commands/shared.js";

export type CommandSummary = Omit<Command, "execute" | "disableHttp">;

export interface ParsedCommandRequest {
  input: string;
  name: string;
  arguments: string[];
  flags: Record<string, string | boolean>;
  command: CommandSummary;
  matchedBy: "name" | "alias";
}

const summarizeCommand = (command: Command): CommandSummary => ({
  ...command,
  aliases: [...command.aliases],
  dependencies: [...command.dependencies],
  args: [...command.args],
});

export const listLegacyCommandSummaries = (): CommandSummary[] =>
  getLegacyCommands()
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((element) => summarizeCommand(element));

export const findLegacyCommand = (query: string): Command | undefined => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;
  return getLegacyCommands().find(
    command =>
      command.name.toLowerCase() === normalized ||
      command.aliases.some(alias => alias.toLowerCase() === normalized),
  );
};

export const parseLegacyCommandInput = (
  input: string,
): ParsedCommandRequest | undefined => {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  const parts = trimmed.split(/\s+/);
  const rawName = parts[0];
  if (rawName === undefined) return undefined;
  const command = findLegacyCommand(rawName);
  if (!command) return undefined;
  const parsed = parseArguments(parts.slice(1));
  return {
    input: trimmed,
    name: command.name,
    arguments: parsed.positionals,
    flags: parsed.flags,
    command: summarizeCommand(command),
    matchedBy:
      command.name.toLowerCase() === rawName.toLowerCase()
        ? "name"
        : "alias",
  };
};

export const getLegacyCommandSummary = (
  query: string,
): CommandSummary | undefined => {
  const command = findLegacyCommand(query);
  return command ? summarizeCommand(command) : undefined;
};
