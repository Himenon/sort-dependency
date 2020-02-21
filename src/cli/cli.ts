import commander from "commander";
import { SourcePathInvalidError, NotInstalledDotEngineError, CliArgumentError } from "./exceptions";
import * as PathFactory from "./PathFactory";
import * as path from "path";
import * as dot from "./dot";

const isInvalidPath = require("is-invalid-path");

export type Output = {
  filename: PathFactory.Type;
  outputType: "svg" | "png";
  extension: string;
  skipRender: boolean;
};

export interface CLIArguments {
  /** Root Directory */
  root: PathFactory.Type;
  /** Sarch Parameter */
  search:
    | {
        /** Library Name */
        start: string;
        /** Library Name */
        stop: string;
      }
    | undefined;
  /** hide message */
  noPrint: boolean;
  /** output path */
  output?: Output;
  /** cache directory */
  cacheDir?: PathFactory.Type;
  /** ignore search pattern */
  ignore: string[];
}

const dotInstalled = dot.checkInstalled();

export const validateCliArguments = (args: commander.Command): CLIArguments => {
  if (typeof args["root"] !== "string" || isInvalidPath(args["root"])) {
    throw new SourcePathInvalidError("`--root` arguments does not selected.");
  }
  if ((!args["start"] && args["stop"]) || (args["start"] && !args["stop"])) {
    throw new CliArgumentError("Please set value both `--start` and `--stop`");
  }
  if (args["start"] && typeof args["start"] !== "string") {
    throw new SourcePathInvalidError("`--start` arguments not found.");
  }
  if (args["stop"] && typeof args["stop"] !== "string") {
    throw new SourcePathInvalidError("`--stop` arguments not found.");
  }
  if (args["cacheDir"] && (typeof args["cacheDir"] !== "string" || isInvalidPath(args["cacheDir"]))) {
    throw new CliArgumentError("`--cache-dir` require valid directory path.");
  }
  if (args["ignore"] && typeof args["ignore"] !== "string") {
    throw new CliArgumentError("`--ignore` please input string path pattern.");
  }
  if (args["output"] && typeof args["output"] !== "string" && ![".png", ".svg"].includes(path.extname(args["output"]))) {
    throw new SourcePathInvalidError("`--output` invalid value.");
  }
  return {
    root: PathFactory.create({ source: args["root"] }),
    search: args["start"] &&
      args["stop"] && {
        start: args["start"],
        stop: args["stop"],
      },
    noPrint: !!args["noPrint"],
    output: args["output"] && {
      filename: PathFactory.create({ source: args["output"] }),
      extension: path.extname(args["output"]),
      outputType: path.extname(args["output"]).slice(1) as "png" | "svg",
      skipRender: dotInstalled ? !!args["skipRender"] : false,
    },
    cacheDir: args["cacheDir"] && PathFactory.create({ source: args["cacheDir"] }),
    ignore: args["ignore"].split("|"),
  };
};

export const executeCommandLine = (): CLIArguments => {
  commander
    .version(require("../../package.json").version) // add webpack.DefinePlugin
    .option("--root [directory]", "Root directory")
    .option("--start [package.json name]", "Start library name")
    .option("--stop [package.json name]", "Stop library name")
    .option("--no-print", "hide message")
    .option("--output [output file]", "support .png, .svg")
    .option("--skip-render", "stop auto using `dot` engine.")
    .option("--cache-dir [directory]", "require cache directory")
    .option("--ignore [string pattern]", "split '|' pattern,", "**/node_modules/**")
    .parse(process.argv);
  return validateCliArguments(commander);
};
