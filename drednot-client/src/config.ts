import { BACKEND_URL } from "@backend/utils/config";

export interface ZenithraConfig {
  backendUrl?: string;
  defaultPrefix: string;
}

let _config: ZenithraConfig = {
  backendUrl: String(BACKEND_URL),
  defaultPrefix: "?",
};

export const setConfig = (config: ZenithraConfig): void => {
  _config = { ..._config, ...config };
};

export const getConfig = (): Readonly<ZenithraConfig> => _config;
