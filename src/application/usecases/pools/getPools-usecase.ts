import { UniswapV3PoolService } from "@/domain/pools/service";

export class GetTopPoolsUseCase {
  constructor(private readonly poolService: UniswapV3PoolService) {}

  async execute() {
    let topPools = await this.poolService.getPoolsNoCache();

    if (topPools.length > 0) return topPools;

    topPools = await this.poolService.getTopPools();

    return topPools;
  }
}
