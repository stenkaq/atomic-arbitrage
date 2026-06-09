import { createPublicClient, http, parseAbi, PublicClient } from "viem";
import { mainnet } from "viem/chains";
import { PoolState } from "./types";
import { AlchemyConfig } from "@/config/config";
import { formatUrl } from "@/utils/url-helper";

const UniswapV3PoolABI = parseAbi([
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() external view returns (uint128)",
  "function tickSpacing() external view returns (int24)",
]);

export interface AlchemyGateway {
  getPoolState(poolAddress: `0x${string}`): Promise<PoolState | null>;
}

export class AlchemyGatewayImpl implements AlchemyGateway {
  publicClient: PublicClient;

  constructor(private readonly config: AlchemyConfig) {
    const url = formatUrl(this.config.rpcUrl, [this.config.apiKey]);

    this.publicClient = createPublicClient({
      chain: mainnet,
      transport: http(url),
    });
  }

  async getPoolState(poolAddress: `0x${string}`): Promise<PoolState | null> {
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
