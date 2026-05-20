import { User as UserTable } from "@tables/index.js";
import { registerButtonHandler } from "@handlers/interaction/buttonInteractionHandler.js";
import { isInteractionOwner } from "@Rmigrations/shared/interaction.js";
import {
  createUsernameErrorReply,
  createUsernameSkipReply,
} from "@Rmigrations/logic/001/messages.js";
import { userNeedsUsername } from "@Rmigrations/logic/001/shared.js";
import { USERNAME_SKIP_HANDLER_KEY } from "@Rmigrations/logic/001/constants.js";

export const registerSkipUsernameButtonHandler = (): void => {
  registerButtonHandler(USERNAME_SKIP_HANDLER_KEY, async ({ interaction, parsedCustomId }) => {
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
    UserTable.markUsernameSkipped(interaction.user.id);
    await interaction.reply(createUsernameSkipReply());
  });
};
