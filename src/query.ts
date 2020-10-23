import * as Graph from "@himenon/graph";

export interface Params {
  graph: Graph.Type;
  start: string;
  stop: string;
  nodeFilterPattern: RegExp;
  edgeFilterPattern: RegExp;
}

/**
 * 入力ノード`start`に入力辺がなく、終端ノードが`stop`で構成されているGraphの集合と、
 * `start`から`stop`までトポロジカルソートされた結果を返却する
 */
export const findTopologicalSortedGroup = ({ graph, start, stop, nodeFilterPattern, edgeFilterPattern }: Params) => {
  // 幅優先探索を行うことにより、開始位置に入力辺がないグラフを作成する
  const nodeNameList1 = graph.breadthFirstSearch(start);
  const graph2 = graph.createGraphBySources(nodeNameList1);

  // グラフを反転させ、探索Nodeの入力辺を幅優先探索によって消す
  const graph4 = graph2.createReverseGraph();
  const nodeNameList4 = graph4.breadthFirstSearch(stop); // 方向を反転させる
  const graph5 = graph4.createGraphBySources(nodeNameList4); // 探索Nodeから辿れるグラフ空間を作る

  const sourceFilter = (source: string): boolean => !!source.match(nodeFilterPattern);
  const edgeFilter = (source: string, target?: string): boolean => {
    const existSource = sourceFilter(source);
    const existTarget = !!(target && target.match(edgeFilterPattern));
    return existSource && existTarget;
  };
  // 反転させたグラフをもとに戻す
  const resultGraph = graph5.createReverseGraph().createGraphByFilteredFunc(sourceFilter, edgeFilter);
  return {
    graph: resultGraph,
    // トポロジカルソートを行う
    sortResult: resultGraph.topologicalSort(start),
  };
};

export const findIndependents = ({ graph }: { graph: Graph.Type }) => {
  const independentNodes = graph.getIndependentNodes();
  const reverseNodes = graph.createReverseGraph().getIndependentNodes();
  const reverseIndependentsNodes = reverseNodes.filter((node) => !independentNodes.includes(node));
  // 反転した集合にも含まれている場合はスタンドアローンなライブラリ
  const standaloneIndependents = reverseNodes.filter((node) => independentNodes.includes(node));
  return {
    independentNodes,
    reverseIndependentsNodes,
    standaloneIndependents,
  };
};
