import type { Interaction } from "discord.js";
import { handleSlashCommand } from "@command/_slashCommandHandler";

const buttonCache = new Map<string, { onClick: (interaction: Interaction) => void; options?: { single?: boolean } }>();

export const addButtonRecord = ({
  customId,
  onClick,
  options,
}: {
  customId: string;
  onClick: (interaction: Interaction) => void;
  options?: {
    single?: boolean;
  };
}): void => {
  if (options === undefined) {
    buttonCache.set(customId, { onClick });
    return;
  }
  buttonCache.set(customId, { onClick, options });
};

export default async function handleInteraction(interaction: Interaction): Promise<void> {
  if (interaction.isButton()) {
    const onClick = buttonCache.get(interaction.customId);
    if (onClick !== undefined) {
      onClick.onClick(interaction);
      if (onClick.options?.single === true) buttonCache.delete(interaction.customId);
    }
    return;
  }

  if (interaction.isChatInputCommand()) await handleSlashCommand(interaction);
}
