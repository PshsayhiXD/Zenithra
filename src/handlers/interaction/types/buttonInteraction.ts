import type {
  AddPersistentRecordOptions,
  ButtonHandler,
} from "@handlers/interaction/types/persistentInteraction.js";

export interface AddButtonRecordOptions
  extends AddPersistentRecordOptions<ButtonHandler> {
  onClick?: ButtonHandler;
}
