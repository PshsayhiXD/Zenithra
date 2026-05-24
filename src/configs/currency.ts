import { Decimal } from "decimal.js";

const BASE = new Decimal("1e-16");

export const CURRENCY = {
  FEE_PERCENT: new Decimal("0.05"), // 5%
  COLUMN_NAME: "currency",
  BASE,
  units: {
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
  } as const,

  formatUnits: [
    ["<:res_flux_crystals:1502673687160291450>", BASE.mul(1_000_000_000)],
    ["<:res_hyper_rubber:1502673706709680148>", BASE.mul(10_000_000)],
    ["<:res_silica_crystals:1502673754390790184>", BASE.mul(100_000)],
    ["<:comp_iron:1502673596638564562>", BASE.mul(1000)],
    ["<:comp_exp:1502673571594502295>", BASE.mul(100)],
    ["<:res_metal:1502673731242299492>", BASE.mul(10)],
    ["<:res_explosives:1502673665106514132>", BASE.mul(1)],
  ] as const,

} as const;
