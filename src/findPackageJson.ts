import * as os from "os";
import { PackageJson } from "type-fest";
import * as fs from "fs";
import * as path from "path";
import Glob from "glob";

export interface FoundPackageJson {
  [path: string]: PackageJson;
}

const getPackageJson = (filename: string): PackageJson | undefined => {
  try {
    return JSON.parse(fs.readFileSync(filename, { encoding: "utf-8" }));
  } catch (error) {
    console.error([`Read error: ${error.message}`, `File: ${filename}`].join(os.EOL));
    return undefined;
  }
};

export const findPackageJson = (baseDir: string, ignore: string[] = ["**/node_modules/**"]): FoundPackageJson => {
  const searchPatternString = path.join(baseDir, "**", "package.json");
  console.info(`Search package.json pattern: ${searchPatternString}`);
  console.info(`Ignore package.json pattern: ${ignore.length ? ignore.join(",") : "Nothing"}`);
  const packageJsonPathList = Glob.sync(searchPatternString, { ignore });
  console.info(`Load: ${packageJsonPathList.length} package.json`);
  return packageJsonPathList.reduce<FoundPackageJson>((found, packageJsonPath) => {
    const pkg = getPackageJson(packageJsonPath);
    if (pkg) {
      found[packageJsonPath] = pkg;
    }
    return found;
  }, {});
};
