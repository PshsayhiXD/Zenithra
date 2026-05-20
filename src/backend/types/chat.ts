export interface ParsedChatMessage {
  username: string;
  rank: string | null;
  badges: string[];
  message: string;
}

export interface ChatMessageResponse {
  username: string;
  message: string;
  userId: string;
  isLinked: boolean;
  discordId?: string;
  command?: {
    name: string;
    arguments: string[];
    raw: string;
  };
  execution?: {
    result: unknown;
    replies: unknown[];
  };
}

export interface ChatIdentityResponse {
  userId: string;
  username: string;
  isLinked: boolean;
  platform: "discord" | "drednot";
}
