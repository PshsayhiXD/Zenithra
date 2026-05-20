import { Decimal } from "decimal.js";

export const BASE = new Decimal("1e-16");

const units = {
  "<:res_flux_crystals:1502673687160291450>": BASE.mul(1_000_000_000),
  "<:res_hyper_rubber:1502673706709680148>": BASE.mul(10_000_000),
  "<:res_silica_crystals:1502673754390790184>": BASE.mul(100_000),
  "<:comp_iron:1502673596638564562>": BASE.mul(1000),
  "<:comp_exp:1502673571594502295>": BASE.mul(100),
  "<:res_metal:1502673731242299492>": BASE.mul(10),
  "<:res_explosives:1502673665106514132>": BASE.mul(1),

  "[res_flux_crystals]": BASE.mul(1_000_000_000),
  "[res_hyper_rubber]": BASE.mul(10_000_000),
  "[res_silica_crystals]": BASE.mul(100_000),
  "[comp_metal]": BASE.mul(1000),
  "[comp_iron]": BASE.mul(1000),
  "[comp_exp]": BASE.mul(100),
  "[res_metal]": BASE.mul(10),
  "[res_explosives]": BASE.mul(1),

  "k": BASE.mul(1000),
  "m": BASE.mul(1_000_000),
  "b": BASE.mul(1_000_000_000),
  "t": BASE.mul(1_000_000_000_000),

  "flux": BASE.mul(1_000_000_000),
  "rubber": BASE.mul(10_000_000),
  "silica": BASE.mul(100_000),
  "metal": BASE.mul(10),
  "iron": BASE.mul(10),
  "exp": BASE.mul(1),
  "explosive": BASE.mul(1),
  "comp_metal": BASE.mul(1000),
  "comp_exp": BASE.mul(100),
} as const;

const formatUnits = [
  ["<:res_flux_crystals:1502673687160291450>", BASE.mul(1_000_000_000)],
  ["<:res_hyper_rubber:1502673706709680148>", BASE.mul(10_000_000)],
  ["<:res_silica_crystals:1502673754390790184>", BASE.mul(100_000)],
  ["<:comp_iron:1502673596638564562>", BASE.mul(1000)],
  ["<:comp_exp:1502673571594502295>", BASE.mul(100)],
  ["<:res_metal:1502673731242299492>", BASE.mul(10)],
  ["<:res_explosives:1502673665106514132>", BASE.mul(1)],
] as const;

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
