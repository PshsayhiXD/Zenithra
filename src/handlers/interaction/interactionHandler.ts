import type { Interaction } from "discord.js";
import { handleSlashCommand } from "@commands/_slashCommandHandler.js";
import { handleButtonInteraction } from "@handlers/interaction/buttonInteractionHandler.js";
import { handleSelectInteraction } from "@handlers/interaction/selectInteractionHandler.js";

export default async function handleInteraction(
  interaction: Interaction,
): Promise<void> {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
    return;
  }

  if (interaction.isStringSelectMenu()) {
    await handleSelectInteraction(interaction);
    return;
  }

  if (interaction.isChatInputCommand()) {
    await handleSlashCommand(interaction);
  }

  // Modal submits and other interaction types are not handled yet.
}
