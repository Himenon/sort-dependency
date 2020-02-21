import { execSync } from "child_process";
import chalk from "chalk";
import * as os from "os";

export const checkInstalled = (): boolean => {
  try {
    execSync("type dot");
    return true;
  } catch (error) {
    return false;
  }
};

export const dot = (args: string, cwd: string = process.cwd()) => {
  console.info(chalk.blueBright("command" + ": " + args + os.EOL));
  return execSync(`dot ${args}`, { cwd })
    .toString()
    .trim();
};
