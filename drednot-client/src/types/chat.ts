export interface ParsedChatMessage {
  username: string;
  rank: string | null;
  badges: string[];
  message: string;
}
