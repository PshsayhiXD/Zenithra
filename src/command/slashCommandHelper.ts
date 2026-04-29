import type { RESTPostAPIApplicationCommandsJSONBody, APIApplicationCommandOption } from "discord-api-types/v10";
import { ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";

import type { SlashCommand } from "@command/types/slashCommand.js";

type SlashArgument = NonNullable<SlashCommand["args"]>[number];

export const serializeSlashCommand = (command: SlashCommand): RESTPostAPIApplicationCommandsJSONBody => ({
    name: command.name,
    description: command.description ?? "No description provided.",
    type: ApplicationCommandType.ChatInput,
    options: command.args?.map((argument): APIApplicationCommandOption => serializeOption(argument)) ?? [],
    dm_permission: "dmPermission" in command ? (command.dmPermission ?? true) : undefined,
  });

const serializeOption = (argument: SlashArgument): APIApplicationCommandOption => {
  const base = {
    name: argument.name,
    description: argument.description,
    required: argument.required ?? false,
  };

  switch (argument.type) {
    case ApplicationCommandOptionType.String: {
      return {
        ...base,
        type: ApplicationCommandOptionType.String,
        ...(Array.isArray(argument.choices) && argument.choices.length > 0
          ? { choices: argument.choices }
          : {}),
      };
    }

    case ApplicationCommandOptionType.Integer: {
      return {
        ...base,
        type: ApplicationCommandOptionType.Integer,
      };
    }

    case ApplicationCommandOptionType.Number: {
      return {
        ...base,
        type: ApplicationCommandOptionType.Number,
      };
    }

    case ApplicationCommandOptionType.Boolean: {
      return {
        ...base,
        type: ApplicationCommandOptionType.Boolean,
      };
    }

    case ApplicationCommandOptionType.User: {
      return {
        ...base,
        type: ApplicationCommandOptionType.User,
      };
    }

    case ApplicationCommandOptionType.Channel: {
      return {
        ...base,
        type: ApplicationCommandOptionType.Channel,
      };
    }

    case ApplicationCommandOptionType.Role: {
      return {
        ...base,
        type: ApplicationCommandOptionType.Role,
      };
    }

    case ApplicationCommandOptionType.Mentionable: {
      return {
        ...base,
        type: ApplicationCommandOptionType.Mentionable,
      };
    }

    case ApplicationCommandOptionType.Attachment: {
      return {
        ...base,
        type: ApplicationCommandOptionType.Attachment,
      };
    }

    default: {
      return base as APIApplicationCommandOption;
    }
  }
};
