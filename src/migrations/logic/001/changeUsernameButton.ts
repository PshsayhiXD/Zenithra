import { registerButtonHandler } from "@handlers/interaction/buttonInteractionHandler.js";
import { isInteractionOwner } from "@Rmigrations/shared/interaction.js";
import { USERNAME_CHANGE_HANDLER_KEY } from "@Rmigrations/logic/001/constants.js";
import {
  createUsernameErrorReply,
  createUsernameModal,
} from "@Rmigrations/logic/001/messages.js";
import { userNeedsUsername } from "@Rmigrations/logic/001/shared.js";

export const registerChangeUsernameButtonHandler = (): void => {
  registerButtonHandler(USERNAME_CHANGE_HANDLER_KEY, async ({ interaction, parsedCustomId }) => {
    const targetDiscordId = parsedCustomId.args[0];
    const isOwner = isInteractionOwner(interaction.user.id, targetDiscordId);

    if (!isOwner) {
      await interaction.reply(createUsernameErrorReply("This prompt is not for you."));
      return;
    }

    if (!userNeedsUsername(interaction.user.id)) {
      await interaction.reply(createUsernameErrorReply("You already set a username."));
      return;
    }

    await interaction.showModal(createUsernameModal(interaction.user.id));
  });
};
