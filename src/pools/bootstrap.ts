import { appConfig } from "@/config/config.js";
import { AlchemyGatewayImpl } from "./infrastucture/alchemy-gateway.js";
import { GraphStudioGatewayImpl } from "./infrastucture/graph-studio-gateway.js";
import { PoolManagerImpl } from "./domain/pool-manager.js";
import { PoolServiceImpl } from "./domain/pool-service.js";

export async function bootstrap() {
  const graphStudio = new GraphStudioGatewayImpl(appConfig.graphStudio);
  const alchemy = new AlchemyGatewayImpl();
  const poolManager = new PoolManagerImpl();

  const poolService = new PoolServiceImpl(graphStudio, alchemy, poolManager);
  await poolService.getPools();
}
