import { GetTopPoolsUseCase } from "@/application/usecases/pools/getPools-usecase";
import { UniswapV3PoolServiceImpl } from "@/domain/pools/service";
import { appConfig } from "@/infrastucture/config/config";
import { initDb } from "@/infrastucture/db/bootstrap";
import { UniswapV3PoolModel } from "@/infrastucture/db/models/pool-model";
import { AlchemyGatewayImpl } from "@/infrastucture/pools/alchemy-gateway";
import { GraphStudioGatewayImpl } from "@/infrastucture/pools/graph-studio-gateway";
import { UniswapV3PoolEventHandler } from "@/infrastucture/pools/pool-event-handler";
import { UniswapV3PoolRepository } from "@/infrastucture/pools/repository/pool-repository";
import { formatUrl } from "@/utils/url-helper";

export async function bootstrap() {
  await initDb(appConfig.mongoConfig.uri);

  const graphStudio = new GraphStudioGatewayImpl(appConfig);
  const alchemy = new AlchemyGatewayImpl(appConfig.alchemyConfig);
  const poolRepository = new UniswapV3PoolRepository(UniswapV3PoolModel);

  const poolService = new UniswapV3PoolServiceImpl(
    graphStudio,
    alchemy,
    poolRepository,
  );

  const useCase = new GetTopPoolsUseCase(poolService)
  await useCase.execute();

  const eventHandler = new UniswapV3PoolEventHandler(
    poolService,
    formatUrl(appConfig.alchemyConfig.wsUrl, [appConfig.alchemyConfig.apiKey]),
  );
  eventHandler.start();
}
