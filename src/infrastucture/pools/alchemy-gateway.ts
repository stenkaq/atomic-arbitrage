import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { AlchemyConfig } from "@/infrastucture/config/config";
import { formatUrl } from "@/utils/url-helper";
import { ExternalUniswapV3PoolData } from "@/external/domain/pools/types";

const UniswapV3PoolABI = parseAbi([
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() external view returns (uint128)",
  "function tickSpacing() external view returns (int24)",
]);

export interface AlchemyGateway {
  getPoolData(
    poolAddress: `0x${string}`,
  ): Promise<ExternalUniswapV3PoolData | null>;
}

export class AlchemyGatewayImpl implements AlchemyGateway {
  private readonly publicClient;

  constructor(private readonly config: AlchemyConfig) {
    const url = formatUrl(this.config.rpcUrl, [this.config.apiKey]);

    this.publicClient = createPublicClient({
      chain: base,
      transport: http(url),
    });
  }

  async getPoolData(
    poolAddress: `0x${string}`,
  ): Promise<ExternalUniswapV3PoolData | null> {
    const contractConfig = {
      address: poolAddress,
      abi: UniswapV3PoolABI,
    } as const;

    const [slot0Result, liquidityResult, tickSpacingResult] =
      await this.publicClient.multicall({
        contracts: [
          { ...contractConfig, functionName: "slot0" },
          { ...contractConfig, functionName: "liquidity" },
          { ...contractConfig, functionName: "tickSpacing" },
        ],

        allowFailure: true,
      });

    if (
      slot0Result.status === "failure" ||
      liquidityResult.status === "failure" ||
      tickSpacingResult.status === "failure"
    ) {
      return null;
    }

    return {
      tickSpacing: Number(tickSpacingResult.result),
      liquidity: liquidityResult.result.toString(),
      sqrtPriceX96: slot0Result.result[0].toString(),
      tick: Number(slot0Result.result[1]),
    };
  }
}
