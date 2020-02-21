import * as Graph from "../Graph";

describe("graph test", () => {
  test("edge test", () => {
    const graph = Graph.create();
    graph.addEdge("a", "b");
    const state = graph.getState();
    expect(state).toEqual({ nodes: [], edges: { a: ["b"] } });
  });

  test("sourcesから新しいGraphを作成するテスト", () => {
    const graph = Graph.create();
    graph.addNode("a");
    graph.addNode("b");
    graph.addNode("c");
    graph.addNode("d");

    graph.addEdge("a", "b");
    graph.addEdge("a", "c");
    graph.addEdge("b", "c");
    graph.addEdge("c", "d");

    expect(graph.getState()).toEqual({
      nodes: ["a", "b", "c", "d"],
      edges: {
        a: ["b", "c"],
        b: ["c"],
        c: ["d"],
        d: undefined,
      },
    });
  });

  test("createGraphByFilteredFunc", () => {
    const graph = Graph.create({
      nodes: ["a1", "b1", "c1", "d1"],
      edges: {
        a1: ["b1", "c1"],
        b1: ["c1"],
        c1: ["d1"],
        d1: undefined,
      },
    });
    const graph2 = graph.createGraphByFilteredFunc(
      source => {
        return source === "c1";
      },
      (source, target) => {
        return source === "c1" && target === "c1";
      },
    );
    expect(graph2.getState()).toEqual({
      nodes: ["c1"],
      edges: {
        c1: undefined,
      },
    });
  });

  test("topological test", () => {
    const graph = Graph.create();
    ["a", "b", "c", "d", "e", "e2", "e1", "e3"].forEach(node => {
      graph.addNode(node);
    });
    graph.addEdge("a", "e");
    graph.addEdge("a", "c");
    graph.addEdge("a", "b");
    graph.addEdge("b", "d");
    graph.addEdge("c", "d");
    graph.addEdge("e", "e1");
    graph.addEdge("e", "e2");
    graph.addEdge("e1", "e3");
    const result = graph.topologicalSort("a");
    expect(JSON.stringify(result)).toBe(JSON.stringify(["a", "b", "c", "d", "e", "e2", "e1", "e3"]));
  });
});
