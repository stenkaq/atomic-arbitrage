import { Model } from "mongoose";
import { CustomRepository } from "../../db/repository.js";
import { UniswapV3Pool as Domain } from "../../../domain/pools/pool.js";
import { UniswapV3Pool as Schema } from "@/infrastucture/db/models/pool-model.js";

export class UniswapV3PoolRepository extends CustomRepository<Domain, Schema> {
  constructor(model: Model<Schema>) {
    super(model);
  }

  async upsert(pool: Domain): Promise<Domain> {
    return this.upsertById(pool.address, pool);
  }

  async upsertMany(pools: Domain[]): Promise<void> {
    await this.upsertManyById(
      pools.map((pool) => ({ id: pool.address, entity: pool })),
    );
  }

  protected toDomain(doc: Schema): Domain {
    return new Domain({
      protocol: "uniswap_v3",
      address: doc.id,
      token0: {
        address: doc.token0.id,
        decimals: doc.token0.decimals,
        symbol: doc.token0.symbol,
      },
      token1: {
        address: doc.token1.id,
        decimals: doc.token1.decimals,
        symbol: doc.token1.symbol,
      },
      fee: Number(doc.feeTier),
      tickSpacing: 0,
      totalValueLockedUSD: BigInt(doc.totalValueLockedUSD),
    });
  }

  protected toSchema(pool: Domain): Schema {
    return {
      id: pool.address,
      feeTier: pool.fee.toString(),
      token0: {
        id: pool.token0.address,
        symbol: pool.token0.symbol,
        decimals: pool.token0.decimals,
      },
      token1: {
        id: pool.token1.address,
        symbol: pool.token1.symbol,
        decimals: pool.token1.decimals,
      },
      totalValueLockedUSD: pool.totalValueLockedUSD.toString(),
    };
  }
}
