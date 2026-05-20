import type {
  Awaitable,
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";

export type JsonPrimitive = boolean | number | string | null;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export interface ParsedCustomId {
  raw: string;
  segments: string[];
  namespace: string;
  action: string | undefined;
  args: string[];
  handlerKey: string;
}

export interface InteractionRecordOptions {
  single?: boolean;
  persist?: boolean;
}

export interface PersistentInteractionRecord {
  customId: string;
  handlerKey: string;
  metadata?: JsonValue;
  options?: InteractionRecordOptions;
}

export interface TransientInteractionRecord<THandler> {
  handler: THandler;
  options?: InteractionRecordOptions;
}

export interface RoutedInteractionContext<
  TInteraction,
  TRecord extends PersistentInteractionRecord = PersistentInteractionRecord,
> {
  interaction: TInteraction;
  parsedCustomId: ParsedCustomId;
  record?: TRecord;
  metadata?: TRecord["metadata"];
}

export type ButtonHandler = (
  context: RoutedInteractionContext<ButtonInteraction>,
) => Awaitable<void>;

export type SelectHandler = (
  context: RoutedInteractionContext<StringSelectMenuInteraction>,
) => Awaitable<void>;

export type ModalHandler = (
  context: RoutedInteractionContext<ModalSubmitInteraction>,
) => Awaitable<void>;

export interface AddPersistentRecordOptions<THandler> {
  customId: string;
  handlerKey?: string;
  metadata?: JsonValue;
  options?: InteractionRecordOptions;
  ttlMs?: number;
  onInteraction?: THandler;
}
