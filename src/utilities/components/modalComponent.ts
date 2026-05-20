import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { addModalRecord } from "@handlers/interaction/modalInteractionHandler.js";
import type { InteractionRecordOptions } from "@handlers/interaction/types/persistentInteraction.js";
import type { ModalComponentOptions } from "@utilities/components/types/modalComponent.js";

export const createModalComponent = (
  options: ModalComponentOptions,
): ModalBuilder => {
  let recordOptions: InteractionRecordOptions | undefined;
  if (options.single !== undefined || options.persist !== undefined) {
    recordOptions = {};
    if (options.single !== undefined) recordOptions.single = options.single;
    if (options.persist !== undefined) recordOptions.persist = options.persist;
  }
  const modal = new ModalBuilder()
    .setCustomId(options.customId)
    .setTitle(options.title);

  if (options.onSubmit !== undefined || options.handlerKey !== undefined) {
    addModalRecord({
      customId: options.customId,
      ...(options.handlerKey === undefined ? {} : { handlerKey: options.handlerKey }),
      ...(options.metadata === undefined ? {} : { metadata: options.metadata }),
      ...(options.onSubmit === undefined ? {} : { onSubmit: options.onSubmit }),
      ...(recordOptions === undefined ? {} : { options: recordOptions }),
      ...(options.ttlMs === undefined ? {} : { ttlMs: options.ttlMs }),
    });
  }

  if (options.components !== undefined) {
    const components = options.components.map((component) => {
      const input = new TextInputBuilder()
        .setCustomId(component.customId)
        .setStyle(component.style ?? TextInputStyle.Short)
        .setRequired(component.required ?? true);
      if (component.placeholder !== undefined)
        input.setPlaceholder(component.placeholder);
      if (component.value !== undefined)
        input.setValue(component.value);
      if (component.minLength !== undefined)
        input.setMinLength(component.minLength);
      if (component.maxLength !== undefined)
        input.setMaxLength(component.maxLength);
      return new LabelBuilder()
        .setLabel(component.label)
        .setTextInputComponent(input);
    });
    modal.setLabelComponents(components);
  }
  return modal;
};
