export type UniswapV3Protocol =
  | "uniswap_v3"
  | "sushiswap_v3"
  | "pancakeswap_v3";

export interface UniswapV3Tick {
  liquidityGross: bigint;
  liquidityNet: bigint;
}

export interface UniswapV3Pool {
  protocol: UniswapV3Protocol;

  address: string;

  token0: string;
  token1: string;

  fee: number; // (500 == 0.05% feed)
  tickSpacing: number;

  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;

  ticks: Map<string, UniswapV3Tick>;
}

export class UniswapV3PoolImpl implements UniswapV3Pool {
  public readonly protocol: UniswapV3Protocol;

  public readonly address: string;

  public readonly token0: string;
  public readonly token1: string;

  public readonly fee: number;
  public readonly tickSpacing: number;

  public liquidity: bigint;
  public sqrtPriceX96: bigint;
  public tick: number;

  public ticks: Map<string, UniswapV3Tick>;

  constructor(params: UniswapV3Pool) {
    this.protocol = params.protocol;

    this.address = params.address;

    this.token0 = params.token0;
    this.token1 = params.token1;

    this.fee = params.fee;
    this.tickSpacing = params.tickSpacing;

    this.liquidity = params.liquidity;
    this.sqrtPriceX96 = params.sqrtPriceX96;
    this.tick = params.tick;

    this.ticks = params.ticks;
  }
}
