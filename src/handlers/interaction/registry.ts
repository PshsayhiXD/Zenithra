import type {
  ButtonHandler,
  ModalHandler,
  SelectHandler,
  TransientInteractionRecord,
} from "@handlers/interaction/types/persistentInteraction.js";

export const buttonHandlerRegistry = new Map<string, ButtonHandler>();
export const selectHandlerRegistry = new Map<string, SelectHandler>();
export const modalHandlerRegistry = new Map<string, ModalHandler>();

export const transientButtonRegistry =
  new Map<string, TransientInteractionRecord<ButtonHandler>>();
export const transientSelectRegistry =
  new Map<string, TransientInteractionRecord<SelectHandler>>();
export const transientModalRegistry =
  new Map<string, TransientInteractionRecord<ModalHandler>>();

export const registerButtonHandler = (
  handlerKey: string,
  handler: ButtonHandler,
): ButtonHandler => {
  buttonHandlerRegistry.set(handlerKey, handler);
  return handler;
};

export const registerSelectHandler = (
  handlerKey: string,
  handler: SelectHandler,
): SelectHandler => {
  selectHandlerRegistry.set(handlerKey, handler);
  return handler;
};

export const registerModalHandler = (
  handlerKey: string,
  handler: ModalHandler,
): ModalHandler => {
  modalHandlerRegistry.set(handlerKey, handler);
  return handler;
};
