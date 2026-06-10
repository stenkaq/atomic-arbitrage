import { Model } from "mongoose";
import { Pool } from "../types.js";
import { CustomRepository } from "../../db/repository.js";

export class PoolRepository extends CustomRepository<Pool> {
  constructor(model: Model<Pool>) {
    super(model);
  }

  async upsert(pool: Pool): Promise<void> {
    await this.upsertById(pool.id, {
      feeTier: pool.feeTier,
      token0: pool.token0,
      token1: pool.token1,
      totalValueLockedUSD: pool.totalValueLockedUSD,
    });
  }

  async upsertMany(pools: Pool[]): Promise<void> {
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
