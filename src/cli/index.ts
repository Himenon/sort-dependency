import * as fs from "fs";
import * as os from "os";
import * as Model from "../model";
import * as Repository from "../repository";
import * as Graph from "@himenon/graph";
import * as Generator from "../Generator";
import * as Cli from "./cli";
import * as Query from "../query";
import { PackageJson } from "type-fest";
import chalk from "chalk";
import { dot } from "./dot";

const updateGraphParams = (graph: Graph.Type, packages: PackageJson[]) => {
  packages.forEach((pkg) => {
    const pkgName = pkg.name;
    if (!pkgName) {
      return;
    }
    graph.addNode(pkgName);
    Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }).forEach((depName) => {
      graph.addEdge(pkgName, depName);
    });
  });
};

const generateGraph = (dotSource: string, output: Cli.Output) => {
  const filename = output.filename.absoluteRootPath;
  const dotFilename = filename.replace(output.extension, ".dot");
  fs.writeFileSync(dotFilename, dotSource, { encoding: "utf-8" });
  console.info(chalk.green("Info") + `: output ${dotFilename}` + os.EOL);
  const command = `-T ${output.outputType} ${output.filename.original.replace(output.extension, ".dot")} > ${output.filename.original}`;
  if (!output.skipRender) {
    dot(command);
    console.info(chalk.green("Info") + `: output ${filename}` + os.EOL);
  }
};

const main = async () => {
  const args = Cli.executeCommandLine();
  const model = Model.create({
    baseDir: args.root.absoluteRootPath,
    cacheDir: args.cacheDir && args.cacheDir.absoluteRootPath,
    ignore: args.ignore,
  });
  const repository = Repository.create(model);
  const cacheGraphState = repository.getCache();
  const graph = Graph.create(cacheGraphState);

  if (!cacheGraphState) {
    const packages = repository.getPackages();
    updateGraphParams(graph, packages);
    repository.updateCache(graph.getState());
  }

  if (!args.search) {
    const { independentNodes, reverseIndependentsNodes, standaloneIndependents } = Query.findIndependents({ graph });
    console.info(chalk.green("Info") + ": Top libraries (Suggest: '--start')" + os.EOL);
    independentNodes.forEach((independentNode, idx) => {
      console.info(`${idx + 1}. ${independentNode}`);
    });
    console.info("");
    console.info(chalk.green("Info") + ": Deep core library (Suggest: '--stop')" + os.EOL);
    reverseIndependentsNodes.forEach((independentNode, idx) => {
      console.info(`${idx + 1}. ${independentNode}`);
    });
    console.info("");
    console.info(chalk.green("Info") + ": Standalone library" + os.EOL);
    standaloneIndependents.forEach((independentNode, idx) => {
      console.info(`${idx + 1}. ${independentNode}`);
    });
    console.info("");
    if (args.output) {
      const dotSource = Generator.generateDotSource(graph, [], "tree");
      generateGraph(dotSource, args.output);
    }
    return;
  }
  const { graph: resultGraph, sortResult } = Query.findTopologicalSortedGroup({
    graph,
    start: args.search.start,
    stop: args.search.stop,
    nodeFilterPattern: new RegExp(".*"),
    edgeFilterPattern: new RegExp(".*"),
  });

  if (!args.noPrint) {
    console.info(chalk.green("Topological sorting result") + `: ${args.search.start} -> ${args.search.stop}` + os.EOL);
    sortResult.forEach((value, idx) => {
      console.info(`${idx + 1}. ${value}`);
    });
    console.info("");
  }

  if (args.output) {
    const dotSource = Generator.generateDotSource(resultGraph, sortResult, "topological-sort");
    generateGraph(dotSource, args.output);
  }
};

main().catch((error) => {
  console.error(chalk.red("Error") + `: ${error.message}`);
});
