import type { TextInputStyle } from "discord.js";
import type { JsonValue } from "@handlers/interaction/types/persistentInteraction.js";
import type { AddModalRecordOptions } from "@handlers/interaction/types/modalInteraction.js";

export interface ModalTextInputOptions {
  customId: string;
  label: string;
  style?: TextInputStyle;
  placeholder?: string;
  value?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface ModalComponentOptions {
  customId: string;
  title: string;
  components?: ModalTextInputOptions[];
  onSubmit?: AddModalRecordOptions["onSubmit"];
  handlerKey?: string;
  metadata?: JsonValue;
  single?: boolean;
  persist?: boolean;
  ttlMs?: number;
}
