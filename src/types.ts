// src/types.ts
// Shared domain types used across all modules.

import type { Address } from 'viem';

export interface PoolState {
  address: Address;
  token0: Address;
  token1: Address;
  decimals0: number;
  decimals1: number;
  fee: number;
  sqrtPriceX96: bigint;
  tick: number;
  liquidity: bigint;
}

export interface PoolConfig {
  address: Address;
  token0: Address;
  token1: Address;
  fee: number;
}

export interface TokenInfo {
  symbol: string;
  decimals: number;
}

export interface Hop {
  poolState: PoolState;
  zeroForOne: boolean;
}

// A directed edge in the arbitrage token graph: one swap direction through one pool.
export interface Edge {
  from: string;
  to: string;
  pool: Address;
  zeroForOne: boolean;
  rate: number;
  weight: number;
  poolState: PoolState;
}

export type Graph = Map<string, Edge[]>;

export interface Cycle {
  edges: Edge[];
  rate: number;
}
