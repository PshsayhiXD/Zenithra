import type { Command } from "@commands/types/command.js";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createLogger } from "@utilities/logger.js";

const log = createLogger("CommandLoader");
const cmdsPath = path.join(__dirname, "legacyCommands");

export const commands: Command[] = [];

const isCommand = (value: unknown): value is Command => {
  if (value === null || typeof value !== "object") return false;
  const object = value as Partial<Command>;
  return (
    typeof object.name === "string" &&
    typeof object.id === "number" &&
    typeof object.execute === "function" &&
    Array.isArray(object.aliases) &&
    Array.isArray(object.args) &&
    Array.isArray(object.dependencies) &&
    object.permission !== undefined
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

export const loadCommands = (loadedCommands: Command[]): Promise<void> => {
  commands.length = 0;
  commands.push(...loadedCommands);
  log.info("Commands loaded", { count: commands.length });
  return Promise.resolve();
};

export const readCommands = async (): Promise<Command[]> => {
  const cmds: Command[] = [];
  try {
    const files = await fs.readdir(cmdsPath, { recursive: true });
    for (const file of files) {
      if (!file.endsWith(".js")) continue;
      const filePath = path.join(cmdsPath, file);
      const module_: unknown = await import(pathToFileURL(filePath).href);
      const resolved = getDefaultExport(module_);
      if (!isCommand(resolved)) {
        log.warn("Invalid command module skipped", { file });
        continue;
      }
      cmds.push(resolved);
    }
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.warn("Failed to read commands directory", { error: error_.message });
  }

  const names = new Map<string, Command>();
  const aliases = new Map<string, Command>();
  const ids = new Map<number, Command>();

  for (const cmd of cmds) {
    const existingName = names.get(cmd.name);
    if (existingName !== undefined) {
      const newName = `${cmd.name}_${String(cmd.id)}`;
      log.warn("Duplicate command name", {
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
    cmd.aliases = cmd.aliases.map(alias => {
      const existingAlias = aliases.get(alias);
      if (existingAlias !== undefined) {
        const newAlias = `${alias}_${cmd.name}`;
        log.warn("Duplicate alias", {
          value: alias,
          originalCommand: existingAlias.name,
          originalId: existingAlias.id,
          duplicateCommand: cmd.name,
          duplicateId: cmd.id,
          renamed: newAlias,
        });
        aliases.set(newAlias, cmd);
        return newAlias;
      }
      aliases.set(alias, cmd);
      return alias;
    });
    const existingId = ids.get(cmd.id);
    if (existingId !== undefined) {
      const newId = Math.sqrt(cmd.id);
      log.warn("Duplicate command id", {
        value: cmd.id,
        originalCommand: existingId.name,
        duplicateCommand: cmd.name,
        reassigned: newId,
      });
      cmd.id = newId;
    }
    ids.set(cmd.id, cmd);
  }
  log.info("Commands read complete", { count: cmds.length });
  return cmds;
};
