import { UniswapV3Pool, UniswapV3PoolState } from "@/domain/pools/pool";
import { UniswapV3PoolData } from "@/domain/pools/types";
import { AlchemyGateway } from "@/infrastucture/pools/alchemy-gateway";
import { GraphStudioGateway } from "@/infrastucture/pools/graph-studio-gateway";
import { UniswapV3PoolRepository } from "@/infrastucture/pools/repository/pool-repository";

export interface UniswapV3PoolService {
  getTopPools(): Promise<UniswapV3Pool[]>;
  getPoolsNoCache(): Promise<UniswapV3Pool[]>;
  add(pool: UniswapV3Pool): void;
  get(address: string): UniswapV3Pool;
  has(address: string): boolean;
  updateState(address: string, state: Partial<UniswapV3PoolState>): void;
  updateTick(
    address: string,
    tickLower: number,
    tickUpper: number,
    liquidityDelta: bigint,
  ): void;
  addresses(): string[];
}

export class UniswapV3PoolServiceImpl implements UniswapV3PoolService {
  constructor(
    private readonly graphStudio: GraphStudioGateway,
    private readonly alchemy: AlchemyGateway,
    private readonly repository: UniswapV3PoolRepository,
    private readonly poolMap = new Map<string, UniswapV3Pool>(),
  ) {}

  async getTopPools(): Promise<UniswapV3Pool[]> {
    let topPools = await this.graphStudio.getTopPools();

    const pools = await Promise.all(
      topPools.map(async (poolData) => {
        const state = await this.alchemy.getPoolData(
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

        this.add(pool);

        return pool;
      }),
    );

    return pools.filter((pool) => pool !== undefined);
  }

  async getPoolData(address: string): Promise<UniswapV3PoolData | null> {
    const poolData = await this.alchemy.getPoolData(address as `0x${string}`);
    if (poolData === null) return null;

    return {
      tickSpacing: poolData.tickSpacing,
      liquidity: BigInt(poolData?.liquidity),
      sqrtPriceX96: BigInt(poolData?.sqrtPriceX96),
      tick: Number(poolData?.tick),
    };
  }

  async getPoolsNoCache(): Promise<UniswapV3Pool[]> {
    return await this.repository.getAll();
  }

  async save(pool: UniswapV3Pool): Promise<UniswapV3Pool> {
    return await this.repository.save(pool);
  }

  add(pool: UniswapV3Pool): void {
    this.poolMap.set(pool.address, pool);
  }

  get(address: string): UniswapV3Pool {
    return this.getPoolOrThrow(address);
  }

  has(address: string): boolean {
    return this.poolMap.has(address);
  }

  updateState(address: string, state: Partial<UniswapV3PoolState>): void {
    this.getPoolOrThrow(address).syncState(state);
  }

  updateTick(
    address: string,
    tickLower: number,
    tickUpper: number,
    liquidityDelta: bigint,
  ): void {
    this.getPoolOrThrow(address).applyLiquidityDelta(
      tickLower,
      tickUpper,
      liquidityDelta,
    );
  }

  addresses(): string[] {
    return Array.from(this.poolMap.keys());
  }

  private getPoolOrThrow(address: string): UniswapV3Pool {
    const pool = this.poolMap.get(address);

    if (pool) return pool;

    throw new Error(`[PoolManager.get] Pool not found. address: ${address}`);
  }
}
