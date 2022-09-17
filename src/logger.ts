import chalk from "chalk";
import { isDebug } from "./options";

const log = (...message: any[]) => console.log(...message);

const success = (...message: any[]) => console.log(chalk.green(...message));

const warning = (...message: any[]) => console.log(chalk.yellow(...message));

const info = (...message: any[]) => console.log(chalk.blue(...message));

const error = (...message: any[]) => console.log(chalk.red(...message));

const debug = (...message: any[]) =>
  isDebug()
    ? console.log(chalk.whiteBright("🔧 [DEBUG]", ...message))
    : undefined;

export default { success, warning, info, error, log, debug };
