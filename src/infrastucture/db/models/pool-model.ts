import mongoose, { Schema } from "mongoose";

interface Token {
  id: string;
  symbol: string;
  decimals: string;
}

export interface UniswapV3Pool {
  id: string;
  feeTier: string;
  token0: Token;
  token1: Token;
  tickSpacing: number;
  totalValueLockedUSD: string;
}

const TokenSchema = new Schema<Token>(
  {
    id: { type: String, required: true },
    symbol: { type: String, required: true },
    decimals: { type: String, required: true },
  },
  { _id: false },
);

const UniswapV3PoolSchema = new Schema<UniswapV3Pool>({
  id: { type: String, required: true },
  feeTier: { type: String, required: true },
  token0: { type: TokenSchema, required: true },
  token1: { type: TokenSchema, required: true },
  tickSpacing: { type: Number, required: true },
  totalValueLockedUSD: { type: String, required: true },
});

export const UniswapV3PoolModel = mongoose.model<UniswapV3Pool>(
  "UniswapV3Pool",
  UniswapV3PoolSchema,
);
