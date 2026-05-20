export interface ParsedCommandResponse {
  name: string;
  arguments: string[];
  raw?: string;
}

export interface ExecuteCommandOptions {
  input: string;
  userId?: string;
  username?: string;
}

export interface ExecuteCommandResponse {
  result: unknown;
  replies: unknown[];
  deprecated?: Record<string, string>;
}

export interface ChatCommandContext {
  input: string;
  username: string;
  userId: string;
}
