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

export interface MongoConfig {
  uri: string;
}

export interface AppConfig {
  graphStudioConfig: GraphStudioConfig;
  subgraphConfig: SubgraphConfig;
  alchemyConfig: AlchemyConfig;
  mongoConfig: MongoConfig;
}

function getEnv(key: string): string {
  const env = process.env[key];
  if (env) {
    return env;
  }

  throw new Error(`Env is undefined: ${key}`);
}

export const appConfig: AppConfig = {
  graphStudioConfig: {
    apiKey: getEnv("GRAPH_STUDIO_API_KEY"),
    url: getEnv("SUBGRAPH_URL"),
  },
  subgraphConfig: {
    baseId: getEnv("SUBGRAPH_ID"),
  },
  alchemyConfig: {
    apiKey: getEnv("ALCHEMY_API_KEY"),
    rpcUrl: getEnv("ALCHEMY_RPC_URL"),
    wsUrl: getEnv("ALCHEMY_WS_URL"),
  },
  mongoConfig: {
    uri: getEnv("MONGODB_URI"),
  },
};
