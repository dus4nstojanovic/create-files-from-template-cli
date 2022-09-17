import { getOptions } from "./options";
import chalk from "chalk";
import Logger from "./logger";

const run = async () => {
  try {
    const debug = Logger.success("create-files-cli has started");

    Logger.info("retrieving options...");
    const options = await getOptions();
    Logger.success("options retrieved");
    Logger.debug("Options\n", JSON.stringify(options, undefined, 2));

    Logger.info("generating files...");
  } catch (e) {
    Logger.error(chalk.red(e));
  }
};

run();
