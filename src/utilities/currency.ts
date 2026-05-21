import { Decimal } from "decimal.js";
import { CURRENCY } from "@configs/currency.js";
const { BASE, units, formatUnits } = CURRENCY;

const hasUnit = (value: string): value is keyof typeof units => value in units;

export const formatCurrency = (amount: bigint | number | Decimal): string => {
  let remaining = new Decimal(amount.toString());
  if (remaining.lte(0)) {
    const last = formatUnits.at(-1);
    return `${last?.[0] ?? "x"}x0`;
  }
  const parts: string[] = [];
  for (const [icon, value] of formatUnits) {
    const count = remaining.div(value).floor();
    if (count.lte(0)) continue;
    parts.push(`${icon}x${count.toString()}`);
    remaining = remaining.mod(value);
  }
  // Add any leftover fraction of the smallest unit
  if (remaining.gt(0)) {
    const last = formatUnits.at(-1);
    parts.push(`${last?.[0] ?? "x"}x${String(remaining.div(BASE).toNumber())}`);
  }
  return parts.join(" ");
};

export const normalizeAmount = (value: bigint | number | Decimal | string): number => {
  const d = new Decimal(value.toString());
  if (d.gte(0)) return d.div(BASE).floor().mul(BASE).toNumber();
  return d.div(BASE).ceil().mul(BASE).toNumber();
};

export const parseCurrency = (input: string): number => {
  let total = new Decimal(0);
  const normalized = input
    .toLowerCase()
    .replaceAll(",", "")
    .replaceAll(/(<:[_a-z]+:\d+>|\[\w+])x([\d.]+)/g, "$1 $2");
  const parts = normalized.split(/\s+/);
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part === undefined || part === "") continue;
    if (hasUnit(part)) {
      const unitValue = units[part];
      const next = parts[index + 1];
      if (next !== undefined && /^[\d.]+$/.test(next)) {
        total = total.plus(new Decimal(next).mul(unitValue));
        index++;
        continue;
      }
      total = total.plus(unitValue);
      continue;
    }
    const match = part.match(/^([\d.]+)([[\]_a-z]+|<:[_a-z]+:\d+>)?$/);
    if (match === null) continue;
    const rawValue = match[1];
    if (rawValue === undefined) continue;
    const value = new Decimal(rawValue);
    const suffix = match[2];
    if (suffix === undefined || suffix === "") {
      const next = parts[index + 1];
      if (next !== undefined && hasUnit(next)) {
        total = total.plus(value.mul(units[next]));
        index++;
        continue;
      }
      total = total.plus(value);
      continue;
    }
    if (!hasUnit(suffix)) {
      total = total.plus(value);
      continue;
    }
    total = total.plus(value.mul(units[suffix]));
  }

  return total.toNumber();
};
