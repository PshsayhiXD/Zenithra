export const code = {
  1: "Success",
  0: "Warning",
  3: "User-Defined Error",
  4: "Internal Error",
  5: "Unknown Error",
  Success: 1,
  Warning: 0,
  UserDefinedError: 3,
  InternalError: 4,
  UnknownError: 5,
} as const;

export type CodeNumber = Extract<(typeof code)[keyof typeof code], number>;
