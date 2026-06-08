import { configDotenv } from "dotenv";

configDotenv();

export interface GraphStudioConfig {
  apiKey: string;
  url: string;
}

export interface SubgraphConfig {
  baseId: string;
}

export interface AlchemyConfig {
  apiKey: string;
  rpcUrl: string;
  wsUrl: string;
}

export interface AppConfig {
  graphStudio: GraphStudioConfig;
  subgraph: SubgraphConfig;
  alchemy: AlchemyConfig;
}

function getEnv(key: string): string {
  const env = process.env[key];
  if (env) {
    return env;
  }

  throw new Error(`Env is undefined: ${key}`);
}

export const appConfig: AppConfig = {
  graphStudio: {
    apiKey: getEnv("GRAPH_STUDIO_API_KEY"),
    url: getEnv("SUBGRAPH_URL"),
  },
  subgraph: {
    baseId: getEnv("SUBGRAPH_ID"),
  },
  alchemy: {
    apiKey: getEnv("ALCHEMY_API_KEY"),
    rpcUrl: getEnv("ALCHEMY_RPC_URL"),
    wsUrl: getEnv("ALCHEMY_WS_URL")
  },
};
