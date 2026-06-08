import { AppConfig, GraphStudioConfig } from "@/config/config.js";
import axios from "axios";
import { PoolData } from "./types.js";
import { formatUrl } from "@/utils/url-helper.js";

export interface GraphStudioGateway {
  getTopPools(): Promise<PoolData[]>;
}

export class GraphStudioGatewayImpl implements GraphStudioGateway {
  private url: string;

  constructor(private readonly config: AppConfig) {
    this.url = formatUrl(this.config.graphStudioConfig.url, [
      this.config.graphStudioConfig.apiKey,
      this.config.subgraphConfig.baseId,
    ]);
  }

  async getTopPools(): Promise<PoolData[]> {
    const query = `
{
  pools(orderBy: totalValueLockedUSD, orderDirection: desc, first: 100) {
    id
    feeTier
    token0 {
      id
      symbol
      decimals
    }
    token1 {
      id
      symbol
      decimals
    }
    totalValueLockedUSD
  }
}
`;

    try {
      const response = await axios.post(
        this.url,
        {
          query,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const pools = response.data.data.pools;

      return pools;
    } catch (e) {
      throw new Error("[GraphStudioGateway.getTopPools]: Error", { cause: e });
    }
  }
}
