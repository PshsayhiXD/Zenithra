import { Decimal } from "decimal.js";
import { CURRENCY } from "@configs/currency.js";

const { BASE, units, formatUnits } = CURRENCY;

const hasUnit = (value: string): value is keyof typeof units => value in units;
const parseDecimal = (value: Decimal.Value): Decimal => new Decimal(value);
const amountPattern = /^(?:\d+(?:\.\d+)?|\.\d+)$/;

export const decimalToString = (value: Decimal.Value): string => {
  const decimal = parseDecimal(value);
  return decimal.toFixed(decimal.decimalPlaces());
};

export const isFiniteDecimal = (value: Decimal.Value): boolean => parseDecimal(value).isFinite();

export const formatCurrency = (amount: Decimal.Value): string => {
  let remaining = parseDecimal(amount);
  if (remaining.lte(0)) {
    const last = formatUnits.at(-1);
    return `${last?.[0] ?? "x"}x0`;
  }
  const parts: string[] = [];
  for (const [icon, value] of formatUnits) {
    const unit = parseDecimal(value);
    const count = remaining.div(unit).floor();
    if (count.lte(0)) continue;
    parts.push(`${icon}x${count.toFixed(0)}`);
    remaining = remaining.mod(unit);
  }
  if (remaining.gt(0)) {
    const last = formatUnits.at(-1);
    const safeValue = remaining.div(BASE);
    parts.push(`${last?.[0] ?? "x"}x${safeValue.toFixed(0)}`);
  }
  return parts.join(" ");
};

export const snapToBase = (value: Decimal.Value): Decimal => {
  const decimal = parseDecimal(value);
  if (decimal.gte(0)) return decimal.div(BASE).floor().mul(BASE);
  return decimal.div(BASE).ceil().mul(BASE);
};

export const parseCurrency = (input: string): Decimal => {
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
      if (next !== undefined && amountPattern.test(next)) {
        total = total.plus(new Decimal(next).mul(unitValue));
        index++;
        continue;
      }
      total = total.plus(unitValue);
      continue;
    }
    const match = part.match(/^(\d+(?:\.\d+)?|\.\d+)([[\]_a-z]+|<:[_a-z]+:\d+>)?$/);
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

  return snapToBase(total);
};
