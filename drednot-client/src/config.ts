export interface ZenithraConfig {
  backendUrl?: string;
}

let _config: ZenithraConfig = {};

export const setConfig = (config: ZenithraConfig): void => {
  _config = { ..._config, ...config };
};

export const getConfig = (): Readonly<ZenithraConfig> => _config;
