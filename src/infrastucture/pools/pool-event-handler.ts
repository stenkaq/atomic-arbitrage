import {
  createPublicClient,
  webSocket,
  parseAbi,
  type Log,
  type DecodeEventLogReturnType,
  decodeEventLog,
} from "viem";
import { mainnet } from "viem/chains";
import type { PoolManager } from "../../domain/pools/pool-manager.js";

const POOL_ABI = parseAbi([
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
  "event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
  "event Burn(address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
  "event Initialize(uint160 sqrtPriceX96, int24 tick)",
]);

export class PoolEventHandler {
  private client: ReturnType<typeof createPublicClient>;
  private lastUpdatedBlock = new Map<string, bigint>();
  private coldPoolQueue = new Set<string>();

  constructor(
    private readonly poolManager: PoolManager,
    private readonly wsUrl: string,
  ) {
    this.client = createPublicClient({
      chain: mainnet,
      transport: webSocket(this.wsUrl),
    });
  }

  start(): void {
    this.client.watchEvent({
      events: POOL_ABI,
      onLogs: (logs) => {
        for (const log of logs) this.dispatch(log);
      },
      onError: (err) =>
        console.error("[PoolEventHandler.start] subscription error", err),
    });
  }

  private dispatch(log: Log): void {
    if (!log.topics[0]) return;

    let decodedEvent: DecodeEventLogReturnType<typeof POOL_ABI>;
    try {
      decodedEvent = decodeEventLog({
        abi: POOL_ABI,
        data: log.data,
        topics: log.topics,
      });
    } catch {
      return;
    }

    const address = log.address.toLowerCase();

    switch (decodedEvent.eventName) {
      case "Swap":
        this.onSwap(address, decodedEvent.args, log.blockNumber);
        break;
      case "Mint":
        this.onMint(address, decodedEvent.args, log.blockNumber);
        break;
      case "Burn":
        this.onBurn(address, decodedEvent.args, log.blockNumber);
        break;
      case "Initialize":
        this.onInitialize(address, decodedEvent.args);
        break;
    }
  }

  private onSwap(
    address: string,
    params: { sqrtPriceX96: bigint; liquidity: bigint; tick: number },
    blockNumber: bigint | null,
  ): void {
    if (!this.poolManager.has(address)) {
      this.enqueueColdPool(address);
      return;
    }

    if (blockNumber !== null && this.isStale(address, blockNumber)) return;

    this.poolManager.updateState(address, {
      sqrtPriceX96: params.sqrtPriceX96,
      liquidity: params.liquidity,
      tick: params.tick,
    });

    if (blockNumber !== null) this.lastUpdatedBlock.set(address, blockNumber);
    this.notifyPathfinder(address);
  }

  private onMint(
    address: string,
    params: { tickLower: number; tickUpper: number; amount: bigint },
    blockNumber: bigint | null,
  ): void {
    if (!this.poolManager.has(address)) {
      this.enqueueColdPool(address);
      return;
    }

    if (blockNumber !== null && this.isStale(address, blockNumber)) return;

    this.poolManager.updateTick(
      address,
      params.tickLower,
      params.tickUpper,
      params.amount,
    );

    if (blockNumber !== null) this.lastUpdatedBlock.set(address, blockNumber);
    this.notifyPathfinder(address);
  }

  private onBurn(
    address: string,
    params: { tickLower: number; tickUpper: number; amount: bigint },
    blockNumber: bigint | null,
  ): void {
    if (!this.poolManager.has(address)) {
      this.enqueueColdPool(address);
      return;
    }

    if (blockNumber !== null && this.isStale(address, blockNumber)) return;

    this.poolManager.updateTick(
      address,
      params.tickLower,
      params.tickUpper,
      -params.amount,
    );

    if (blockNumber !== null) this.lastUpdatedBlock.set(address, blockNumber);
    this.notifyPathfinder(address);
  }

  private onInitialize(
    address: string,
    _params: { sqrtPriceX96: bigint; tick: number },
  ): void {
    if (!this.poolManager.has(address)) {
      this.enqueueColdPool(address);
    }
  }

  private isStale(address: string, blockNumber: bigint): boolean {
    const last = this.lastUpdatedBlock.get(address);
    return last !== undefined && blockNumber <= last;
  }

  private enqueueColdPool(address: string): void {
    if (this.coldPoolQueue.has(address)) return;
    this.coldPoolQueue.add(address);
  }

  private notifyPathfinder(_address: string): void {}
}
