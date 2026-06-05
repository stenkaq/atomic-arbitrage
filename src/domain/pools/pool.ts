export type UniswapV3Protocol =
  | "uniswap_v3"
  | "sushiswap_v3"
  | "pancakeswap_v3";

export interface UniswapV3PoolTick {
  liquidityGross: bigint;
  liquidityNet: bigint;
}
export interface UniswapV3PoolState {
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tick: number;
}

export interface UniswapV3PoolParams extends UniswapV3PoolState {
  protocol: UniswapV3Protocol;
  address: string;
  token0: string;
  token1: string;
  fee: number; // (500 == 0.05% fee)
  tickSpacing: number;
  ticks: Map<string, UniswapV3PoolTick>;
}

export interface UniswapV3Pool {
  readonly protocol: UniswapV3Protocol;
  readonly address: string;
  readonly token0: string;
  readonly token1: string;
  readonly fee: number;
  readonly tickSpacing: number;

  readonly liquidity: bigint;
  readonly sqrtPriceX96: bigint;
  readonly currentTick: number;

  getTick(tickIndex: string): UniswapV3PoolTick | undefined;
  syncState(state: Partial<UniswapV3PoolState>): void;
  applyLiquidityDelta(
    tickLower: number,
    tickUpper: number,
    liquidityDelta: bigint,
  ): void;
}

export class UniswapV3PoolImpl implements UniswapV3Pool {
  public readonly protocol: UniswapV3Protocol;

  public readonly address: string;

  public readonly token0: string;
  public readonly token1: string;

  public readonly fee: number;
  public readonly tickSpacing: number;

  private _liquidity: bigint;
  private _sqrtPriceX96: bigint;
  private _tick: number;

  private readonly _ticks: Map<string, UniswapV3PoolTick>;

  constructor(params: UniswapV3PoolParams) {
    this.protocol = params.protocol;
    this.address = params.address.toLowerCase();

    this.token0 = params.token0;
    this.token1 = params.token1;

    this.fee = params.fee;
    this.tickSpacing = params.tickSpacing;

    this._liquidity = params.liquidity;
    this._sqrtPriceX96 = params.sqrtPriceX96;
    this._tick = params.tick;

    this._ticks = new Map(params.ticks);
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
