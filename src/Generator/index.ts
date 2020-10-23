import * as os from "os";
import * as Graph from "@himenon/graph";
import * as Template from "./Template";

export const generateDotSource = (graph: Graph.Type, orderedList: string[], graphType: "tree" | "topological-sort") => {
  const { nodes, edges } = graph.getState();
  const nonOrderedCluster: string =
    graph.getEdgeLength() > 0
      ? Object.entries(edges)
          .map<string[]>(([source, targets]) => {
            if (!targets) {
              return [];
            }
            return targets.map((target) => {
              return `    "${source}" -> "${target}"`;
            });
          })
          .reduce<string[]>((total, current) => {
            return total.concat(current);
          }, [])
          .join(";" + os.EOL) + ";"
      : nodes.map((node) => `    "${node};"`).join(os.EOL);

  if (graphType === "tree") {
    return Template.generateTreeDiagram(nonOrderedCluster);
  }
  return Template.generateTopologicalSortGraph(nonOrderedCluster, orderedList);
};
