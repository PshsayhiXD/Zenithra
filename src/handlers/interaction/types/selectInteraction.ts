import type {
  AddPersistentRecordOptions,
  SelectHandler,
} from "@handlers/interaction/types/persistentInteraction.js";

export interface AddSelectRecordOptions
  extends AddPersistentRecordOptions<SelectHandler> {
  onSelect?: SelectHandler;
}
