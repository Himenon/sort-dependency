export type NodeName = string;

type EdgeMap = {
  [key: string]: string[] | undefined;
};

export interface State {
  nodes: string[];
  edges: EdgeMap;
}

export const create = (defaultState?: State) => {
  const state: State = defaultState || {
    nodes: [],
    edges: {},
  };

  const addNode = (nodeName: string) => {
    if (!state.nodes.includes(nodeName)) {
      state.nodes.push(nodeName);
    }
  };

  const addEdge = (src: string, dest: string) => {
    const edgeSet: string[] = state.edges[src] || [];
    if (!edgeSet.includes(dest)) {
      state.edges[src] = edgeSet.concat(dest);
    }
  };

  const removeNode = (targetNode: string) => {
    state.nodes = state.nodes.filter(node => node !== targetNode);
  };

  const removeEdge = (src: string, dest: string) => {
    const edges = state.edges[src] || [];
    const result = (state.edges[src] = edges.filter(edge => edge !== dest));
    if (result.length == 0) {
      delete state.edges[src];
    }
  };

  const removeEdgeAll = (src: string) => {
    if (!!state.edges[src]) {
      delete state.edges[src];
    }
  };

  const getNodeLength = (): number => {
    return state.nodes.length;
  };

  const getEdgeLength = (): number => {
    return Object.values(state.edges).reduce((total, edges) => {
      return total + (edges ? edges.length : 0);
    }, 0);
  };

  /**
   * 入力sourceからみたグラフ空間内のEdge
   * @param source
   */
  const getEdgeNameList = (source: string): string[] | undefined => {
    return state.edges[source];
  };

  /**
   * 入力sourceを基準にしたグラフ空間のState
   * @param source
   */
  const getStateByName = (source: string): State => {
    return {
      nodes: [source],
      edges: {
        [source]: getEdgeNameList(source),
      },
    };
  };

  const createGraphByFilteredFunc = (sourceFilter?: (source: string) => boolean, edgeFilter?: (source: string, target?: string) => boolean) => {
    const nodes = state.nodes.filter(source => {
      // sourceをフィルタリング
      return sourceFilter ? sourceFilter(source) : true;
    });
    const edges = Object.entries(state.edges)
      .filter(entry => {
        // sourceをフィルタリング
        return sourceFilter ? sourceFilter(entry[0]) : true;
      })
      .reduce((all, [source, targets]) => {
        const edges = (state.edges[source] || []).filter(target => {
          // edgeをフィルタリング
          return edgeFilter ? edgeFilter(source, target) : true;
        });
        return {
          ...all,
          [source]: edges.length > 0 ? edges : undefined,
        };
      }, {});
    return create({ nodes, edges });
  };

  const getState = (): State => {
    return state;
  };

  /**
   * nodeNameに紐づくNodeとEdgeからGraphを作成する
   * @param sources
   */
  const createGraphBySources = (sources: string[]) => {
    const newState: State = sources.reduce<State>(
      (total, source) => {
        total.edges[source] = getEdgeNameList(source);
        return total;
      },
      { nodes: sources, edges: {} },
    );
    return create(newState);
  };

  /**
   * 現在のgraphのcloneを作成する
   */
  const clone = () => {
    const cloneState: State = JSON.parse(JSON.stringify(state));
    return create(cloneState);
  };

  /**
   * targetNodeNameに対して有向を持つnodeNameを取得する
   * @param targetNode
   */
  const getInputEdges = (targetNode: string): string[] => {
    return Object.entries(state.edges)
      .filter(([source, targets]) => {
        return (targets || []).includes(targetNode);
      })
      .map(entry => entry[0]);
  };

  const createReverseGraph = () => {
    const reverseGraph = create({ nodes: state.nodes, edges: {} });
    Object.entries(state.edges).forEach(([source, targets]) => {
      (targets || []).forEach(target => {
        reverseGraph.addEdge(target, source); // reverse !!!
      });
    });
    return reverseGraph;
  };

  /**
   * 幅優先探索
   */
  const breadthFirstSearch = (source: string): string[] => {
    const queue: string[] = [source];
    const sortedNodeNameList: string[] = [];
    const visitedNode = new Set();
    while (queue.length > 0) {
      const currentNodeName = queue.pop();
      if (typeof currentNodeName !== "string") {
        throw new TypeError("Current Node name not string type");
      }
      sortedNodeNameList.push(currentNodeName);
      const edges = getEdgeNameList(currentNodeName) || [];
      edges.forEach(target => {
        if (!visitedNode.has(target)) {
          visitedNode.add(target);
          queue.push(target);
        }
      });
    }
    return sortedNodeNameList;
  };

  const topologicalSort = (source: string): string[] => {
    // 結果を蓄積
    const sortedNodeNameList: string[] = [];
    // 入力edgeをもたないnode
    const startNodeList: string[] = [source];
    // 作業用のグラフ空間
    const graphSpace = clone();
    while (startNodeList.length > 0) {
      // 探索を開始するNodeを取得
      const currentNodeName = startNodeList.pop();
      if (typeof currentNodeName !== "string") {
        throw new TypeError("Current Node name not string type");
      }
      // 探索を始めた段階で結果に追加
      sortedNodeNameList.push(currentNodeName);
      // 探索を始めたNodeに属するEdgeを取得
      const edges = getEdgeNameList(currentNodeName) || [];
      // graph空間から探索を始めたNodeを取り除く
      graphSpace.removeNode(currentNodeName);
      // graph空間から探索を始めたNodeに紐づくEdgeを消す
      graphSpace.removeEdgeAll(currentNodeName);
      edges.forEach(edge => {
        // Nodeの集合全体から、入力が存在するか
        const inputEdges = graphSpace.getInputEdges(edge);
        graphSpace.removeEdge(currentNodeName, edge);
        // 外部からの入力が存在するか
        if (inputEdges.length) {
          return;
        }
        // 入力edgeを持っていない場合追加、
        startNodeList.push(edge);
      });
    }
    return sortedNodeNameList;
  };

  const getIndependentNodes = (): string[] => {
    const independentNodes: string[] = [];
    state.nodes.forEach(node => {
      const inputEdges = getInputEdges(node);
      if (inputEdges.length === 0) {
        independentNodes.push(node);
      }
    });
    return independentNodes;
  };

  return {
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    removeEdgeAll,
    getInputEdges,
    getIndependentNodes,
    getState,
    getStateByName,
    clone,
    createGraphByFilteredFunc,
    createGraphBySources,
    getNodeLength,
    getEdgeLength,
    breadthFirstSearch,
    topologicalSort,
    createReverseGraph,
  };
};

export type Type = ReturnType<typeof create>;
