export const generateTopologicalSortGraph = (cluster1: string, orderedList: string[]) => `digraph G {
  rankdir = LR;
  graph [splines=ortho, nodesep=0.8];
  node [shape=box];
  ${cluster1}
  { rank=same; ${orderedList.map((n) => `"${n}"`).join("; ")}; } // cluster作成後似記述する必要がある
}
`;

export const generateTreeDiagram = (cluster1: string) => `digraph G {
  rankdir = LR;
${cluster1}
}
`;
