import { User as UserTable } from "@tables/index.js";
import { registerModalHandler } from "@handlers/interaction/modalInteractionHandler.js";
import { isInteractionOwner } from "@Rmigrations/shared/interaction.js";
import {
  USERNAME_MODAL_FIELD_ID,
  USERNAME_SUBMIT_HANDLER_KEY,
} from "@Rmigrations/logic/001/constants.js";
import {
  createUsernameErrorReply,
  createUsernameSuccessReply,
} from "@Rmigrations/logic/001/messages.js";
import { userNeedsUsername } from "@Rmigrations/logic/001/shared.js";
import { validateUsername } from "@Rmigrations/logic/001/validation.js";

export const registerSubmitUsernameModalHandler = (): void => {
  registerModalHandler(USERNAME_SUBMIT_HANDLER_KEY, async ({ interaction, parsedCustomId }) => {
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

    const value = interaction.fields.getTextInputValue(USERNAME_MODAL_FIELD_ID);
    const result = validateUsername(value, interaction.user.id);

    if (!result.ok) {
      await interaction.reply(createUsernameErrorReply(result.error));
      return;
    }

    UserTable.setUsername(interaction.user.id, result.username);
    await interaction.reply(createUsernameSuccessReply(result.username));
  });
};
