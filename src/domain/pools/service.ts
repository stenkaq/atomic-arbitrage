import { AlchemyGateway } from "@/infrastucture/pools/alchemy-gateway.js";
import { GraphStudioGateway } from "@/infrastucture/pools/graph-studio-gateway.js";
import { UniswapV3Pool } from "./pool.js";
import { UniswapV3PoolRepository } from "@/infrastucture/pools/repository/pool-repository.js";
import { UniswapV3PoolManager } from "./pool-manager.js";

export interface UniswapV3PoolService {
  getPools(): Promise<void>;
}

export class UniswapV3PoolServiceImpl implements UniswapV3PoolService {
  constructor(
    private readonly graphStudio: GraphStudioGateway,
    private readonly alchemy: AlchemyGateway,
    private readonly poolManager: UniswapV3PoolManager,
    private readonly repository: UniswapV3PoolRepository,
  ) {}

  async getPools(): Promise<void> {
    const pools = await this.graphStudio.getTopPools();

    await Promise.all(
      pools.map(async (poolData) => {
        const state = await this.alchemy.getPoolState(
          poolData.id as `0x${string}`,
        );

        if (!state) return;

        const pool = new UniswapV3Pool({
          protocol: "uniswap_v3",
          address: poolData.id,
          token0: {
            address: poolData.token0.id,
            symbol: poolData.token0.symbol,
            decimals: poolData.token0.decimals,
          },
          token1: {
            address: poolData.token1.id,
            symbol: poolData.token1.symbol,
            decimals: poolData.token1.decimals,
          },
          fee: Number(poolData.feeTier),
          tickSpacing: state.tickSpacing,
          totalValueLockedUSD: BigInt(poolData.totalValueLockedUSD),
        });

        pool.syncState({
          liquidity: BigInt(state.liquidity),
          sqrtPriceX96: BigInt(state.sqrtPriceX96),
          tick: state.tick,
        });

        this.save(pool);

        this.poolManager.add(pool);
      }),
    );
  }

  async save(pool: UniswapV3Pool): Promise<UniswapV3Pool> {
    return await this.repository.save(pool);
  }
}
