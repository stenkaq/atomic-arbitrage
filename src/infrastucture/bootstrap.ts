import { appConfig } from "@/config/config.js";
import { AlchemyGatewayImpl } from "./pools/alchemy-gateway.js";
import { GraphStudioGatewayImpl } from "./pools/graph-studio-gateway.js";
import { PoolManagerImpl } from "../domain/pools/pool-manager.js";
import { PoolServiceImpl } from "../domain/pools/pool-service.js";
import { PoolEventHandler } from "./pools/pool-event-handler.js";

export async function bootstrap() {
  const graphStudio = new GraphStudioGatewayImpl(appConfig);
  const alchemy = new AlchemyGatewayImpl(appConfig.alchemyConfig);
  const poolManager = new PoolManagerImpl();

  const poolService = new PoolServiceImpl(graphStudio, alchemy, poolManager);
  await poolService.getPools();

  const eventHandler = new PoolEventHandler(
    poolManager,
    appConfig.alchemyConfig.wsUrl,
  );
  eventHandler.start();
}
