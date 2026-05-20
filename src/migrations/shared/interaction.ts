export const isInteractionOwner = (
  interactionUserId: string,
  targetDiscordId: string | undefined,
): boolean => targetDiscordId !== undefined && interactionUserId === targetDiscordId;
