import { GraphStudioConfig } from "@/config/config.js";
import axios from "axios";
import { PoolData } from "./types.js";

export interface GraphStudioGateway {
  getTopPools(): Promise<PoolData[]>;
}

export class GraphStudioGatewayImpl implements GraphStudioGateway {
  constructor(private readonly config: GraphStudioConfig) {}

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
        this.config.url,
        {
          query,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
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
