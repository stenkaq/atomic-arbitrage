export interface Token {
  id: string;
  symbol: string;
  decimals: string;
}

export interface UniswapV3Pool {
  id: string;
  feeTier: string;
  token0: Token;
  token1: Token;
  totalValueLockedUSD: string;
}

export interface UniswapV3PoolState {
  tickSpacing: number;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
}
