import { defineLegacyCommand, type Command, type CommandResult } from "@commands/types/command.js";
import { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";
import { ButtonStyle, MessageFlags } from "discord.js";

const formatAliases = (cmd: Command): string =>
  cmd.aliases.length > 0 ? cmd.aliases.join(", ") : "None";

const formatCooldown = (cmd: Command): string =>
  typeof cmd.cooldown === "number" ? `${String(cmd.cooldown)}s` : "None";

const formatArguments = (cmd: Command): string =>
  cmd.args.map(argument => argument.required ? `<${argument.name}>` : `[${argument.name}]`).join(" ");

export default defineLegacyCommand({
  name: "help",
  id: 23,
  category: "utility",
  description: "Show a list of commands and view details",
  aliases: ["commands", "h"],
  cooldown: 3,
  args: [],
  permission: {},
  dependencies: ["commands", "components", "code", "config.LEGACY_COMMANDS.HELP.PAGE_SIZE"],
  execute: async ({ message, deps, isDiscord, isDrednot, responses }): Promise<CommandResult> => {
    const { commands: cmdMap, code, components, "config.LEGACY_COMMANDS.HELP.PAGE_SIZE": pageSize } = deps;
    const map = cmdMap as Record<number, Command>;
    const sorted = Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
    const categories = new Map<string, number>();

    for (const cmd of sorted) {
      categories.set(cmd.category, (categories.get(cmd.category) ?? 0) + 1);
    }

    if (isDiscord && message) {
      const pages: NonNullable<Parameters<typeof components.createContainerPagination>[0]["pages"]> = [];

      if (sorted.length === 0) {
        pages.push([
          {
            text: "## Command Help\nNo commands available.",
          },
        ]);
      } else {
        for (let index = 0; index < sorted.length; index += pageSize) {
          const pageCommands = sorted.slice(index, index + pageSize);
          const pageNumber = Math.floor(index / pageSize) + 1;
          const totalPages = Math.ceil(sorted.length / pageSize);
          pages.push([
            {
              text:
                "## Command Help\n" +
                `Showing **${String(pageCommands.length)}** of **${String(sorted.length)}** commands - ` +
                `Page **${String(pageNumber)} / ${String(totalPages)}**`,
            },
            {
              text:
                `**Categories:** ${[...categories.entries()]
                  .map(([category, count]) => `${category} (${String(count)})`)
                  .join(", ")}`,
            },
            ...pageCommands.map(cmd => {
              const detailId = `help-detail:${message.id}:${String(cmd.id)}`;
              addButtonRecord({
                customId: detailId,
                onClick: async ({ interaction }) => {
                  const detailContainer = components.createContainer({
                    accentColor: "#3498db",
                    autoSeparators: true,
                    components: [
                      {
                        text: `## ${cmd.name}\n${cmd.description}`,
                      },
                      {
                        text:
                          `**Category:** ${cmd.category}\n` +
                          `**Aliases:** ${formatAliases(cmd)}\n` +
                          `**Cooldown:** ${formatCooldown(cmd)}`,
                      },
                      {
                        text:
                          `**Usage:** ${cmd.args.length > 0 ? `${cmd.name} ${formatArguments(cmd)}` : cmd.name}`,
                      },
                    ],
                  });
                  await interaction.reply({
                    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                    components: [detailContainer],
                  });
                },
              });

              return {
                text:
                  `**${cmd.name}**\n` +
                  `${cmd.description}\n` +
                  `Category: ${cmd.category} - Cooldown: ${formatCooldown(cmd)}`,
                button: {
                  id: detailId,
                  emoji: "ℹ️",
                  style: ButtonStyle.Secondary,
                },
              };
            }),
            {
              text: "Use the info button beside a command for arguments, aliases, and cooldown.",
            },
          ]);
        }
      }

      await components.createContainerPagination({
        instanceId: message.id,
        accentColor: "#3498db",
        pages,
        onBuild: async ({ container, nav }) => {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container, nav],
          });
        },
        onUpdate: async ({ interaction }, { container, nav }) => {
          const payload = {
            components: [container, nav],
          };
          if (interaction.isButton()) {
            await interaction.update(payload);
            return;
          }
          if (interaction.isModalSubmit() && interaction.isFromMessage()) {
            await interaction.update(payload);
          }
        },
      });

      return code.Success;
    }

    if (isDrednot)
      responses?.push(
        sorted.length > 0
          ? sorted.map(cmd => cmd.aliases.length > 0 ? `${cmd.name}[${cmd.aliases.join(",")}]` : cmd.name).join(" / ")
          : "No commands available.",
      );

    return code.Success;
  },
});
