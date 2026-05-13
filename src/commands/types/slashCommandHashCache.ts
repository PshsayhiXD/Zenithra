export interface SlashCommandHashCache {
  global?: string;
  guilds?: Record<string, string>;
}