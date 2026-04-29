import crypto from "node:crypto";

const sortValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((v) => sortValue(v));
  if (value === null || typeof value !== "object") return value;
  
  const object = value as Record<string, unknown>;
  const keys = Object.keys(object).toSorted();
  const result: Record<string, unknown> = {};
  
  for (const key of keys) {
    result[key] = sortValue(object[key]);
  }
  
  return result;
};

export const createHash = (value: unknown): string => {
  const json = JSON.stringify(sortValue(value));
  return crypto.createHash("sha256").update(json).digest("hex");
};