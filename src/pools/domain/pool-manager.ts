import { UniswapV3Pool } from "./pool";

export interface PoolManager {
  add(pool: UniswapV3Pool): void;
  get(address: string): UniswapV3Pool;
  has(address: string): boolean;
}

export class PoolManagerImpl implements PoolManager {
  public poolMap: Map<string, UniswapV3Pool>;

  constructor() {
    this.poolMap = new Map();
  }

  public add(pool: UniswapV3Pool): void {
    this.poolMap.set(pool.address, pool);
  }

  public get(address: string): UniswapV3Pool {
    const pool = this.poolMap.get(address);

    if (pool) return pool;

    throw new Error(`[PoolManager.get] Pool not found. address: ${address}`);
  }

  public has(address: string): boolean {
    return this.poolMap.has(address);
  }
}
