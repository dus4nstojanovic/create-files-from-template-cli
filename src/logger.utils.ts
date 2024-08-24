import Logger from "@beezydev/create-files-from-template-base/logger";
import chalk from "chalk";

export const overrideLogger = () => {
  Logger.overrideLoggerSeverity({
    green: chalk.green,
    yellow: chalk.yellow,
    blue: chalk.blue,
    red: chalk.red,
  });
};
