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
  getPoolState(poolAddress: `0x${string}`): Promise<PoolState>;
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

  async getPoolState(poolAddress: `0x${string}`): Promise<PoolState> {
    const contractConfig = {
      address: poolAddress,
      abi: UniswapV3PoolABI,
    } as const;

    const [slot0, liquidity, tickSpacing] = await this.publicClient.multicall({
      contracts: [
        { ...contractConfig, functionName: "slot0" },
        { ...contractConfig, functionName: "liquidity" },
        { ...contractConfig, functionName: "tickSpacing" },
      ],

      allowFailure: false,
    });

    return {
      tickSpacing: Number(tickSpacing),
      liquidity: liquidity.toString(),
      sqrtPriceX96: slot0[0].toString(),
      tick: Number(slot0[1]),
    };
  }
}
