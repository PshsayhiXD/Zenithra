export interface User {
  discordId: string;
  username: string | null;
}

export type UsernameValidationResult =
  | {
    ok: true;
    username: string;
  }
  | {
    ok: false;
    error: string;
  };
