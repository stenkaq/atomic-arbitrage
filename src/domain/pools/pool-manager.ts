import { UniswapV3Pool, UniswapV3PoolState } from "./pool";

export class UniswapV3PoolManager {
  private readonly poolMap = new Map<string, UniswapV3Pool>();

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
