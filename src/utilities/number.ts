const nfFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const formatNumber = (n: number | bigint): string => nfFormatter.format(n);

export const multipliers = {
  b: 1e9,
  k: 1e3,
  m: 1e6,
  t: 1e12,
} as const;
export type Suffix = keyof typeof multipliers;

export const parseNumber = (input: string): number | undefined => {
  const string_ = input.trim().toLowerCase();
  if (/^-?\d+$/.test(string_)) return Number(string_);
  const match = string_.match(/^(-?\d+(\.\d+)?)([bkmt])$/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  const suffix = match[3] as Suffix | undefined;
  const multiplier = suffix ? multipliers[suffix] : undefined;
  if (!multiplier) return undefined;
  const result = value * multiplier;
  if (!Number.isSafeInteger(result)) return undefined;
  return result;
};
