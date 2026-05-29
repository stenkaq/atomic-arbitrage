import { AlchemyGateway } from "../infrastucture/alchemy-gateway.js";
import { GraphStudioGateway } from "../infrastucture/graph-studio-gateway.js";
import { PoolManager } from "./pool-manager.js";
import { UniswapV3PoolImpl } from "./pool.js";

export interface PoolService {
  getPools(): Promise<void>;
}

export class PoolServiceImpl implements PoolService {
  constructor(
    private readonly graphStudio: GraphStudioGateway,
    private readonly alchemy: AlchemyGateway,
    private readonly poolManager: PoolManager,
  ) {}

  async getPools(): Promise<void> {
    const pools = await this.graphStudio.getTopPools();

    await Promise.all(
      pools.map(async (poolData) => {
        const state = await this.alchemy.getPoolState(
          poolData.id as `0x${string}`,
        );

        this.poolManager.add(
          new UniswapV3PoolImpl({
            protocol: "uniswap_v3",
            address: poolData.id,
            token0: poolData.token0.id,
            token1: poolData.token1.id,
            fee: Number(poolData.feeTier),
            tickSpacing: state.tickSpacing,
            liquidity: BigInt(state.liquidity),
            sqrtPriceX96: BigInt(state.sqrtPriceX96),
            tick: state.tick,
            ticks: new Map(),
          }),
        );
      }),
    );
  }
}
