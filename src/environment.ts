import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

const environmentPath = path.resolve(__dirname, "../.env");
const environmentExamplePath = path.resolve(__dirname, "../.env.example");

type EnvironmentValue = string | number | boolean | string[];

let cachedEnvironment: Record<string, EnvironmentValue> | null = null;

const parseValue = (type: string, value: string): EnvironmentValue => {
  if (type === "string") return value;
  if (type === "number") return Number(value);
  if (type === "boolean") return value === "true";
  if (type === "string[]") return value.split(",").map(v => v.trim());
  throw new Error(`Unsupported env type: ${type}`);
};

export const loadEnvironment = (): Record<string, EnvironmentValue> => {
  if (cachedEnvironment !== null) return cachedEnvironment;
  dotenv.config({
    path: environmentPath,
    override: true,
    encoding: "utf8",
  });
  const environmentExample = fs.readFileSync(environmentExamplePath, "utf8");
  const schema = environmentExample
    .split("\n")
    .map(l => l.trim())
    .filter((l): boolean => l !== "" && !l.startsWith("#"))
    .map(line => {
      const [left, ...rest] = line.split("=");
      if (left === undefined || left === "") return null;
      const [key, type] = left.split(":");
      if (key === undefined || key === "" || type === undefined || type === "") return null;
      return {
        key: key.trim(),
        type: type.trim(),
        defaultValue: rest.join("=").trim(),
      };
    })
    .filter(Boolean) as {
    key: string;
    type: string;
    defaultValue?: string;
  }[];
  const result: Record<string, EnvironmentValue> = {};
  for (const { key, type, defaultValue } of schema) {
    if (key === "" || type === "") continue;
    if (type.startsWith("_")) continue;
    const raw = process.env[key] ?? defaultValue;
    if (raw === undefined || raw.length === 0) throw new Error(`Missing required env: ${key}`);
    result[key] = parseValue(type, raw);
  }
  cachedEnvironment = result;
  return cachedEnvironment;
};

export default loadEnvironment();
