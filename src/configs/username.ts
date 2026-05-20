export const USERNAME = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 18,
  // can contain space, but no double space, and no leading/trailing space
  PATTERN: /^[\d_a-z]+(?: [\d_a-z]+)*$/,
} as const;

