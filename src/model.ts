import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { findPackageJson, FoundPackageJson } from "./findPackageJson";
import * as Graph from "./Graph";

export interface Params {
  baseDir: string;
  cacheDir?: string;
  ignore: string[];
}

export interface PrivateState {
  cacheData: FoundPackageJson | undefined;
  cacheFilename: string | undefined;
}

export const create = ({ baseDir, cacheDir, ignore }: Params) => {
  const state: PrivateState = {
    cacheData: undefined,
    cacheFilename: cacheDir ? path.join(cacheDir, "graph-state.json") : undefined,
  };
  return {
    getPackageJsonData: () => {
      if (state.cacheData) {
        return state.cacheData;
      }
      return (state.cacheData = findPackageJson(baseDir, ignore));
    },
    getGraphStateData: (): Graph.State | undefined => {
      if (state.cacheFilename && fs.existsSync(state.cacheFilename)) {
        console.info(`Read cache file: ${state.cacheFilename}` + os.EOL);
        const data = fs.readFileSync(state.cacheFilename, { encoding: "utf-8" });
        return JSON.parse(data);
      }
      return undefined;
    },
    updateGraphStateData: (newGraphState: Graph.State): void => {
      if (!state.cacheFilename) {
        return;
      }
      fs.mkdirSync(path.dirname(state.cacheFilename), { recursive: true });
      fs.writeFileSync(state.cacheFilename, JSON.stringify(newGraphState), { encoding: "utf-8" });
      console.info(`Create cache file: ${state.cacheFilename}` + os.EOL);
    },
  };
};

export type Type = ReturnType<typeof create>;
