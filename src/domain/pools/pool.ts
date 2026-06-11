export type UniswapV3Protocol =
  | "uniswap_v3"
  | "sushiswap_v3"
  | "pancakeswap_v3";

export interface UniswapV3PoolTick {
  liquidityGross: bigint;
  liquidityNet: bigint;
}

export interface UniswapV3Token {
  address: string;
  symbol: string;
  decimals: string;
}
export interface UniswapV3PoolState {
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
}

export interface UniswapV3PoolStaticParams {
  protocol: UniswapV3Protocol;
  address: string;
  token0: UniswapV3Token;
  token1: UniswapV3Token;
  fee: number; // (500 == 0.05% fee)
  tickSpacing: number;
  totalValueLockedUSD: string;
}

export type UniswapV3PoolParams = UniswapV3PoolStaticParams & UniswapV3PoolState;

export class UniswapV3Pool {
  public readonly protocol: UniswapV3Protocol;

  public readonly address: string;

  public readonly token0: UniswapV3Token;
  public readonly token1: UniswapV3Token;

  public readonly fee: number;
  public readonly tickSpacing: number;

  public readonly totalValueLockedUSD: string;

  private _ticks: Map<string, UniswapV3PoolTick>;
  private _liquidity!: bigint;
  private _sqrtPriceX96!: bigint;
  private _tick!: number;

  constructor(params: UniswapV3PoolStaticParams) {
    this.protocol = params.protocol;
    this.address = params.address.toLowerCase();

    this.token0 = params.token0;
    this.token1 = params.token1;

    this.fee = params.fee;
    this.tickSpacing = params.tickSpacing;

    this.totalValueLockedUSD = params.totalValueLockedUSD;

    this._ticks = new Map();
  }

  set liquidity(value: bigint) {
    this._liquidity = value;
  }
  set sqrtPriceX96(value: bigint) {
    this._sqrtPriceX96 = value;
  }
  set tick(value: number) {
    this._tick = value;
  }

  get liquidity(): bigint {
    return this._liquidity;
  }
  get sqrtPriceX96(): bigint {
    return this._sqrtPriceX96;
  }
  get currentTick(): number {
    return this._tick;
  }

  public getTick(tickIndex: string): UniswapV3PoolTick | undefined {
    return this._ticks.get(tickIndex);
  }

  public syncState(state: Partial<UniswapV3PoolState>): void {
    if (state.liquidity !== undefined) this._liquidity = state.liquidity;
    if (state.sqrtPriceX96 !== undefined)
      this._sqrtPriceX96 = state.sqrtPriceX96;
    if (state.tick !== undefined) this._tick = state.tick;
  }

  public applyLiquidityDelta(
    tickLower: number,
    tickUpper: number,
    liquidityDelta: bigint,
  ): void {
    this.applyLiquidityDeltaOnTick(tickLower, liquidityDelta, liquidityDelta);
    this.applyLiquidityDeltaOnTick(tickUpper, liquidityDelta, -liquidityDelta);
  }

  private applyLiquidityDeltaOnTick(
    tickIndex: number,
    grossDelta: bigint,
    netDelta: bigint,
  ): void {
    const key = tickIndex.toString();
    const tick = this._ticks.get(key) ?? {
      liquidityGross: 0n,
      liquidityNet: 0n,
    };

    this._ticks.set(key, {
      liquidityGross: tick.liquidityGross + grossDelta,
      liquidityNet: tick.liquidityNet + netDelta,
    });
  }
}
