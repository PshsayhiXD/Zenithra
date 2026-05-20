import type { ParsedCustomId } from "@handlers/interaction/types/persistentInteraction.js";

export const CUSTOM_ID_SEPARATOR = ":";

export const encodeCustomId = (...segments: string[]): string =>
  segments.join(CUSTOM_ID_SEPARATOR);

export const parseCustomId = (customId: string): ParsedCustomId => {
  const segments = customId.split(CUSTOM_ID_SEPARATOR);
  const [namespace = "", action, ...parameters] = segments;

  return {
    raw: customId,
    segments,
    namespace,
    action,
    args: parameters,
    handlerKey: action === undefined ? namespace : encodeCustomId(namespace, action),
  };
};
