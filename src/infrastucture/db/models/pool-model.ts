import mongoose, { Schema } from "mongoose";

interface Token {
  id: string;
  symbol: string;
  decimals: string;
}

interface Pool {
  _id: string;
  feeTier: string;
  token0: Token;
  token1: Token;
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

const PoolSchema = new Schema<Pool>({
  _id: { type: String, required: true },
  feeTier: { type: String, required: true },
  token0: { type: TokenSchema, required: true },
  token1: { type: TokenSchema, required: true },
  totalValueLockedUSD: { type: String, required: true },
});

export const PoolModel = mongoose.model<Pool>("Pool", PoolSchema);
