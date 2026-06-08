import createGraph from "ngraph.graph";
import { aStar, PathFinder } from "ngraph.path";
import type { Graph, NodeId } from "ngraph.graph";

export type TickData = {
  tickSpacing: string;
};

export interface PathExplorer {
  graph: Graph;
  finder: PathFinder<TickData>;

  findPath(fromToken: string, toToken: string): NodeId[];
}

export type Token = {
  address: string;
};

export type Pair = {
  token0: Token;
  token1: Token;

  tickSpacing: TickData;
};

export class PathExplorerImpl implements PathExplorer {
  constructor(private pairs: Pair[]) {
    this.graph = createGraph();

    this.pairs.forEach((pair) => {
      this.graph.addNode(pair.token0.address);
      this.graph.addNode(pair.token1.address);
      this.graph.addLink(
        pair.token0.address,
        pair.token1.address,
        pair.tickSpacing,
      );
      this.graph.addLink(
        pair.token1.address,
        pair.token0.address,
        pair.tickSpacing,
      );
    });

    this.finder = aStar(this.graph);
  }
  graph: Graph<TickData, any>;
  finder: PathFinder<TickData>;

  findPath(fromToken: string, toToken: string): NodeId[] {
    return this.finder
      .find(fromToken, toToken)
      .reduce<NodeId[]>((acc, node, i, orig) => {
        if (acc.length > 0) {
          acc.push(this.graph.getLink(orig[i - 1].id, node.id)?.data);
        }

        acc.push(node.id);

        return acc;
      }, []);
  }
}
