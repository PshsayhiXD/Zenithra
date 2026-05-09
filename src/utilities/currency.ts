const units = {
  "<:res_flux_crystals:1502673687160291450>": 1_000_000_000n,
  "<:res_hyper_rubber:1502673706709680148>": 10_000_000n,
  "<:res_silica_crystals:1502673754390790184>": 100_000n,
  "<:comp_iron:1502673596638564562>": 1000n,
  "<:comp_exp:1502673571594502295>": 100n,
  "<:res_metal:1502673731242299492>": 10n,
  "<:res_explosives:1502673665106514132>": 1n,

  "[res_flux_crystals]": 1_000_000_000n,
  "[res_hyper_rubber]": 10_000_000n,
  "[res_silica_crystals]": 100_000n,
  "[comp_metal]": 1000n,
  "[comp_iron]": 1000n,
  "[comp_exp]": 100n,
  "[res_metal]": 10n,
  "[res_explosives]": 1n,

  "k": 1000n,
  "m": 1_000_000n,
  "b": 1_000_000_000n,
  "t": 1_000_000_000_000n,

  "flux": 1_000_000_000n,
  "rubber": 10_000_000n,
  "silica": 100_000n,
  "metal": 10n,
  "iron": 10n,
  "exp": 1n,
  "explosive": 1n,
  "comp_metal": 1000n,
  "comp_exp": 100n,
} as const;

const formatUnits = [
  ["<:res_flux_crystals:1502673687160291450>", 1_000_000_000n],
  ["<:res_hyper_rubber:1502673706709680148>", 10_000_000n],
  ["<:res_silica_crystals:1502673754390790184>", 100_000n],
  ["<:comp_iron:1502673596638564562>", 1000n],
  ["<:comp_exp:1502673571594502295>", 100n],
  ["<:res_metal:1502673731242299492>", 10n],
  ["<:res_explosives:1502673665106514132>", 1n],
] as const;

const hasUnit = (value: string): value is keyof typeof units => value in units;

export const formatCurrency = (amount: bigint | number): string => {
  let remaining = BigInt(amount);
  if (remaining === 0n) {
    const last = formatUnits.at(-1);
    return `${last?.[0] ?? "x"}x0`;
  }
  const parts: string[] = [];
  for (const [icon, value] of formatUnits) {
    const count = remaining / value;
    if (count <= 0n) continue;
    parts.push(`${icon}x${count.toLocaleString("en-US")}`);
    remaining %= value;
  }
  return parts.join(" ");
};

export const parseCurrency = (input: string): bigint => {
  let total = 0n;
  const normalized = input
    .toLowerCase()
    .replaceAll(",", "")
    .replaceAll(/(<:[_a-z]+:\d+>|\[\w+])x(\d+)/g, "$1 $2");
  const parts = normalized.split(/\s+/);
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part === undefined || part === "") continue;
    if (hasUnit(part)) {
      const unitValue = units[part];
      const next = parts[index + 1];
      if (next !== undefined && /^\d+$/.test(next)) {
        total += BigInt(next) * unitValue;
        index++;
        continue;
      }
      total += unitValue;
      continue;
    }
    const match = part.match(/^(\d+)([[\]_a-z]+|<:[_a-z]+:\d+>)?$/);
    if (match === null) continue;
    const rawValue = match[1];
    if (rawValue === undefined) continue;
    const value = BigInt(rawValue);
    const suffix = match[2];
    if (suffix === undefined || suffix === "") {
      const next = parts[index + 1];
      if (next !== undefined && hasUnit(next)) {
        total += value * units[next];
        index++;
        continue;
      }
      total += value;
      continue;
    }
    if (!hasUnit(suffix)) {
      total += value;
      continue;
    }
    total += value * units[suffix];
  }

  return total;
};
