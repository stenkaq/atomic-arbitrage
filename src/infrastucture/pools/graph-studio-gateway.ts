import { AppConfig } from "@/infrastucture/config/config.js";
import axios from "axios";
import { formatUrl } from "@/utils/url-helper.js";
import { GraphStudioGatewayError } from "../errors.js";
import { UniswapV3Pool } from "@/external/domain/pools/types.js";

export interface GraphStudioGateway {
  getTopPools(): Promise<UniswapV3Pool[]>;
}

export class GraphStudioGatewayImpl implements GraphStudioGateway {
  private url: string;

  constructor(private readonly config: AppConfig) {
    this.url = formatUrl(this.config.graphStudioConfig.url, [
      this.config.graphStudioConfig.apiKey,
      this.config.subgraphConfig.baseId,
    ]);
  }

  async getTopPools(): Promise<UniswapV3Pool[]> {
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

      if (response.data.errors) {
        const message = response.data.errors
          .map(
            (err: { message?: string }) => err.message ?? JSON.stringify(err),
          )
          .join("; ");
        throw new GraphStudioGatewayError({
          message: message,
          source: this.getTopPools.name,
        });
      }

      const pools = response.data.data?.pools;

      return pools;
    } catch (e) {
      if (e instanceof GraphStudioGatewayError) {
        throw e;
      }
      throw new GraphStudioGatewayError({
        message: e instanceof Error ? e.message : String(e),
        source: this.getTopPools.name,
      });
    }
  }
}
