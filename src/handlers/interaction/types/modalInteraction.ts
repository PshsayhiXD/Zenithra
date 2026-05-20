import type {
  AddPersistentRecordOptions,
  ModalHandler,
} from "@handlers/interaction/types/persistentInteraction.js";

export interface AddModalRecordOptions
  extends AddPersistentRecordOptions<ModalHandler> {
  onSubmit?: ModalHandler;
}
