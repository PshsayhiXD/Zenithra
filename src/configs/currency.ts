import { Decimal } from "decimal.js";
import { EMOJIS } from "@configs/emojis.js";

const K = 1000;
const M = 1_000_000;
const B = 1_000_000_000;
const T = 1_000_000_000_000;

const BASE = new Decimal("1e-16");

export const CURRENCY = {
  FEE_PERCENT: new Decimal("0.05"), // 5%
  COLUMN_NAME: "currency",
  BASE,
  units: {
    [EMOJIS.gold_null]:           BASE.mul(T),
    [EMOJIS.silver_null]:         BASE.mul(10 * B),
    [EMOJIS.res_flux_crystals]:   BASE.mul(B),
    [EMOJIS.res_hyper_rubber]:    BASE.mul(10 * M),
    [EMOJIS.res_silica_crystals]: BASE.mul(100 * K),
    [EMOJIS.comp_metal]:          BASE.mul(K),
    [EMOJIS.comp_exp]:            BASE.mul(100),
    [EMOJIS.res_metal]:           BASE.mul(10),
    [EMOJIS.res_explosives]:      BASE.mul(1),

    "[res_flux_crystals]":   BASE.mul(B),
    "[res_hyper_rubber]":    BASE.mul(10 * M),
    "[res_silica_crystals]": BASE.mul(100 * K),
    "[comp_metal]":          BASE.mul(K),
    "[comp_iron]":           BASE.mul(K), // aliases
    "[comp_exp]":            BASE.mul(100),
    "[res_metal]":           BASE.mul(10),
    "[res_explosives]":      BASE.mul(1),

    "k": BASE.mul(K),
    "m": BASE.mul(M),
    "b": BASE.mul(B),
    "t": BASE.mul(T),

    "flux":      BASE.mul(B),
    "rubber":    BASE.mul(10 * M),
    "silica":    BASE.mul(100 * K),
    "metal":     BASE.mul(10),
    "iron":      BASE.mul(10),
    "exp":       BASE.mul(1),
    "explosive": BASE.mul(1),
    "comp_metal": BASE.mul(K),
    "comp_exp":   BASE.mul(100),
  } as const,

  formatUnits: [
    [EMOJIS.res_flux_crystals,   BASE.mul(B)],
    [EMOJIS.res_hyper_rubber,    BASE.mul(10 * M)],
    [EMOJIS.res_silica_crystals, BASE.mul(100 * K)],
    [EMOJIS.comp_metal,          BASE.mul(K)],
    [EMOJIS.comp_exp,            BASE.mul(100)],
    [EMOJIS.res_metal,           BASE.mul(10)],
    [EMOJIS.res_explosives,      BASE.mul(1)],
  ] as const,

} as const;
