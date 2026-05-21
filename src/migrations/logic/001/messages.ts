import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type APIEmbed,
  type InteractionReplyOptions,
  TextInputStyle,
  type ModalBuilder,
} from "discord.js";
import { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";
import { encodeCustomId } from "@handlers/interaction/customId.js";
import { createModalComponent } from "@utilities/components/modalComponent.js";
import { createEmbed } from "@utilities/components/embedComponent.js";
import {
  USERNAME_CHANGE_HANDLER_KEY,
  USERNAME_MIGRATION_NAMESPACE,
  USERNAME_MODAL_FIELD_ID,
  USERNAME_SKIP_HANDLER_KEY,
  USERNAME_SUBMIT_HANDLER_KEY,
} from "@Rmigrations/logic/001/constants.js";

export const createUsernameMigrationEmbed = (): APIEmbed =>
  createEmbed({
    title: "Username needed",
    description: "Pick a game username. Keep it normal and avoid troll names.",
  }).toJSON();

export const createUsernameMigrationButtons = (
  discordId: string,
): ActionRowBuilder<ButtonBuilder> => {
  const skipCustomId = encodeCustomId(USERNAME_MIGRATION_NAMESPACE, "skip", discordId);
  const changeCustomId = encodeCustomId(USERNAME_MIGRATION_NAMESPACE, "change", discordId);
  addButtonRecord({
    customId: skipCustomId,
    handlerKey: USERNAME_SKIP_HANDLER_KEY,
  });
  addButtonRecord({
    customId: changeCustomId,
    handlerKey: USERNAME_CHANGE_HANDLER_KEY,
  });
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(skipCustomId)
      .setLabel("Skip")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(changeCustomId)
      .setLabel("Change")
      .setStyle(ButtonStyle.Primary),
  );
};

export const createUsernameModal = (discordId: string): ModalBuilder =>
  createModalComponent({
    customId: encodeCustomId(USERNAME_MIGRATION_NAMESPACE, "submit", discordId),
    handlerKey: USERNAME_SUBMIT_HANDLER_KEY,
    title: "Create username",
    components: [
      {
        customId: USERNAME_MODAL_FIELD_ID,
        label: "Username",
        style: TextInputStyle.Short,
        required: true,
        minLength: 3,
        maxLength: 20,
      },
    ],
  });

export const createUsernameSuccessReply = (
  username: string,
): InteractionReplyOptions => ({
  content: `Username saved: ${username}`,
  flags: ["Ephemeral"],
});

export const createUsernameErrorReply = (
  error: string,
): InteractionReplyOptions => ({
  content: error,
  flags: ["Ephemeral"],
});

export const createUsernameSkipReply = (): InteractionReplyOptions => ({
  content: "Skipped.",
  flags: ["Ephemeral"],
});
