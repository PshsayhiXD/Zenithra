import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { SlashCommand } from "@command/types/slashCommand.js";
import { createLogger } from "@utilities/logger.js";

export const slashCommands: SlashCommand[] = [];
const log = createLogger("SlashLoader");

const isSlashCommand = (value: unknown): value is SlashCommand => {
  if (value === null || typeof value !== "object") return false;
  const object = value as Partial<SlashCommand>;
  return (
    typeof object.name === "string" &&
    typeof object.id === "number" &&
    typeof object.execute === "function"
  );
};

const getDefaultExport = (module_: unknown): unknown => {
  if (module_ === null || typeof module_ !== "object") return module_;
  const levelOne = module_ as { default?: unknown };
  if (
    levelOne.default !== undefined &&
    levelOne.default !== null &&
    typeof levelOne.default === "object"
  ) {
    const levelTwo = levelOne.default as { default?: unknown };
    return levelTwo.default ?? levelOne.default;
  }
  return levelOne.default ?? module_;
};

export const loadSlashCommands = (loadedCommands: SlashCommand[]): Promise<void> => {
  slashCommands.length = 0;
  slashCommands.push(...loadedCommands);
  log.info("Slash commands loaded", { count: slashCommands.length });
  return Promise.resolve();
};

const collectJsFiles = async (directory: string): Promise<string[]> => {
  const results: string[] = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await collectJsFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(full);
    }
  }

  return results;
};

export const readSlashCommands = async (): Promise<{
  global: SlashCommand[];
  guild: SlashCommand[];
}> => {
  const globalCmds: SlashCommand[] = [];
  const guildCmds: SlashCommand[] = [];

  try {
    const slashPath = path.join(__dirname, "slashCommands");
    const slashGlobalPath = path.join(slashPath, "global");
    const slashGuildPath = path.join(slashPath, "guild");

    const globalFiles = await collectJsFiles(slashGlobalPath);
    const guildFiles = await collectJsFiles(slashGuildPath);

    if (globalFiles.length === 0 && guildFiles.length === 0) {
      log.info("No slash commands found");
      return { global: globalCmds, guild: guildCmds };
    }

    const names = new Map<string, SlashCommand>();
    const ids = new Map<number, SlashCommand>();

    for (const filePath of globalFiles) {
      const module_: unknown = await import(pathToFileURL(filePath).href);
      const resolved = getDefaultExport(module_);
      if (!isSlashCommand(resolved) || resolved.name === "") {
        log.warn("Invalid slash command skipped", { filePath });
        continue;
      }
      const cmd = resolved;
      const existingName = names.get(cmd.name);
      if (existingName !== undefined) {
        const newName = `${cmd.name}_${String(cmd.id)}`;
        log.warn("Duplicate slash command name", {
          value: cmd.name,
          originalCommand: existingName.name,
          originalId: existingName.id,
          duplicateCommand: cmd.name,
          duplicateId: cmd.id,
          renamed: newName,
        });
        cmd.name = newName;
      }
      names.set(cmd.name, cmd);
      const existingId = ids.get(cmd.id);
      if (existingId !== undefined) {
        const newId = Math.sqrt(cmd.id);
        log.warn("Duplicate slash command id", {
          value: cmd.id,
          originalCommand: existingId.name,
          originalId: existingId.id,
          duplicateCommand: cmd.name,
          duplicateId: cmd.id,
          reassigned: newId,
        });
        cmd.id = newId;
      }
      ids.set(cmd.id, cmd);
      globalCmds.push(cmd);
    }

    for (const filePath of guildFiles) {
      const module_: unknown = await import(pathToFileURL(filePath).href);
      const resolved = getDefaultExport(module_);

      if (!isSlashCommand(resolved) || resolved.name === "") {
        log.warn("Invalid guild slash command skipped", { filePath });
        continue;
      }

      guildCmds.push(resolved);
    }
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.warn("Failed to read slash command directories", { error: error_.message });
  }

  log.info("Slash commands read complete", {
    globalCount: globalCmds.length,
    guildCount: guildCmds.length,
  });

  return { global: globalCmds, guild: guildCmds };
};
