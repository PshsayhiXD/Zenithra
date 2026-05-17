import {
  getLegacyCommandSummary,
  listLegacyCommandSummaries,
  parseLegacyCommandInput,
  type CommandSummary,
  type ParsedCommandRequest
} from "@commands/catalog.js";

export const listCommands = (): CommandSummary[] => listLegacyCommandSummaries();

export const getCommand = (name: string): CommandSummary | undefined => getLegacyCommandSummary(name);

export const parseCommand = (input: string): ParsedCommandRequest | undefined => parseLegacyCommandInput(input);
