import { Decimal } from "decimal.js";
import { EMOJIS } from "@configs/emojis.js";

const BASE = new Decimal("1e-16");

export const CURRENCY = {
  FEE_PERCENT: new Decimal("0.05"), // 5%
  COLUMN_NAME: "currency",
  BASE,
  units: {
    [EMOJIS.res_flux_crystals]: BASE.mul(1_000_000_000),
    [EMOJIS.res_hyper_rubber]: BASE.mul(10_000_000),
    [EMOJIS.res_silica_crystals]: BASE.mul(100_000),
    [EMOJIS.comp_metal]: BASE.mul(1000),
    [EMOJIS.comp_exp]: BASE.mul(100),
    [EMOJIS.res_metal]: BASE.mul(10),
    [EMOJIS.res_explosives]: BASE.mul(1),

    "[res_flux_crystals]": BASE.mul(1_000_000_000),
    "[res_hyper_rubber]": BASE.mul(10_000_000),
    "[res_silica_crystals]": BASE.mul(100_000),
    "[comp_metal]": BASE.mul(1000),
    "[comp_iron]": BASE.mul(1000), // aliases
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
    [EMOJIS.res_flux_crystals, BASE.mul(1_000_000_000)],
    [EMOJIS.res_hyper_rubber, BASE.mul(10_000_000)],
    [EMOJIS.res_silica_crystals, BASE.mul(100_000)],
    [EMOJIS.comp_metal, BASE.mul(1000)],
    [EMOJIS.comp_exp, BASE.mul(100)],
    [EMOJIS.res_metal, BASE.mul(10)],
    [EMOJIS.res_explosives, BASE.mul(1)],
  ] as const,

} as const;
