import { Model } from "mongoose";
import { CustomRepository } from "../../db/repository.js";
import { UniswapV3Pool } from "../types.js";

export class UniswapV3PoolRepository extends CustomRepository<UniswapV3Pool> {
  constructor(model: Model<UniswapV3Pool>) {
    super(model);
  }

  async upsert(pool: UniswapV3Pool): Promise<void> {
    await this.upsertById(pool.id, {
      feeTier: pool.feeTier,
      token0: pool.token0,
      token1: pool.token1,
      totalValueLockedUSD: pool.totalValueLockedUSD,
    });
  }

  async upsertMany(pools: UniswapV3Pool[]): Promise<void> {
    await this.upsertManyById(
      pools.map((pool) => ({
        id: pool.id,
        data: {
          feeTier: pool.feeTier,
          token0: pool.token0,
          token1: pool.token1,
          totalValueLockedUSD: pool.totalValueLockedUSD,
        },
      })),
    );
  }
}
