import { appConfig } from "@/infrastucture/config/config.js";
import { AlchemyGatewayImpl } from "./pools/alchemy-gateway.js";
import { GraphStudioGatewayImpl } from "./pools/graph-studio-gateway.js";
import { initDb } from "./db/bootstrap.js";
import { UniswapV3PoolManagerImpl } from "@/domain/pools/pool-manager.js";
import { UniswapV3PoolServiceImpl } from "@/domain/pools/service.js";
import { UniswapV3PoolEventHandler } from "./pools/pool-event-handler.js";
import { UniswapV3PoolRepository } from "./pools/repository/pool-repository.js";
import { UniswapV3PoolModel } from "./db/models/pool-model.js";

export async function bootstrap() {
  await initDb(appConfig.mongoConfig.uri);

  const graphStudio = new GraphStudioGatewayImpl(appConfig);
  const alchemy = new AlchemyGatewayImpl(appConfig.alchemyConfig);
  const poolManager = new UniswapV3PoolManagerImpl();
  const poolRepository = new UniswapV3PoolRepository(UniswapV3PoolModel);

  const poolService = new UniswapV3PoolServiceImpl(
    graphStudio,
    alchemy,
    poolManager,
    poolRepository,
  );
  await poolService.getPools();

  const eventHandler = new UniswapV3PoolEventHandler(
    poolManager,
    appConfig.alchemyConfig.wsUrl,
  );
  eventHandler.start();
}
