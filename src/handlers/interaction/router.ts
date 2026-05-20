import type { Awaitable } from "discord.js";
import type { Cache } from "@utilities/cache.js";
import { parseCustomId } from "@handlers/interaction/customId.js";
import type {
  PersistentInteractionRecord,
  RoutedInteractionContext,
  TransientInteractionRecord,
} from "@handlers/interaction/types/persistentInteraction.js";

type RoutedHandler<
  TInteraction,
  TRecord extends PersistentInteractionRecord,
> = (context: RoutedInteractionContext<TInteraction, TRecord>) => Awaitable<void>;

interface RouteComponentInteractionOptions<
  TInteraction extends { customId: string },
  TRecord extends PersistentInteractionRecord,
  THandler extends RoutedHandler<TInteraction, TRecord>,
> {
  interaction: TInteraction;
  persistentCache: Cache<TRecord>;
  persistentHandlers: Map<string, THandler>;
  transientHandlers: Map<string, TransientInteractionRecord<THandler>>;
}

export const routeComponentInteraction = async <
  TInteraction extends { customId: string },
  TRecord extends PersistentInteractionRecord,
  THandler extends RoutedHandler<TInteraction, TRecord>,
>({
  interaction,
  persistentCache,
  persistentHandlers,
  transientHandlers,
}: RouteComponentInteractionOptions<TInteraction, TRecord, THandler>): Promise<boolean> => {
  const parsedCustomId = parseCustomId(interaction.customId);
  const transientRecord = transientHandlers.get(interaction.customId);

  if (transientRecord !== undefined) {
    await transientRecord.handler({
      interaction,
      parsedCustomId,
    });

    if (transientRecord.options?.single === true) {
      transientHandlers.delete(interaction.customId);
    }

    return true;
  }

  const record = persistentCache.get(interaction.customId);
  const handlerKey = record?.handlerKey ?? parsedCustomId.handlerKey;
  const handler = persistentHandlers.get(handlerKey);

  if (handler === undefined) return false;

  const context: RoutedInteractionContext<TInteraction, TRecord> = {
    interaction,
    parsedCustomId,
  };

  if (record !== undefined) {
    context.record = record;
    const metadata = record.metadata;

    if (metadata !== undefined) {
      context.metadata = metadata as TRecord["metadata"];
    }
  }

  await handler(context);

  if (record?.options?.single === true) {
    persistentCache.delete(interaction.customId);
  }

  return true;
};
