#!/usr/bin/env node

import { CLIArg, extractArg, getOptions } from "./options";
import Logger from "./logger";
import { createAllDirectoriesAndFilesFromTemplate } from "./files";
import { getOrCreateConfig } from "./config";
import { writeHelpTable } from "./help";

const run = async () => {
  try {
    if (extractArg(CLIArg.VERSION)) {
      Logger.log(require("./package.json").version);
      return;
    }

    if (extractArg(CLIArg.HELP)) {
      writeHelpTable();
      return;
    }

    Logger.success("create-files-cli has started");

    const { config, created } = await getOrCreateConfig();

    if (created) return;

    Logger.info("Retrieving options...");

    const options = await getOptions(config);

    Logger.success("✔ Options retrieved");
    Logger.debug("Options\n", JSON.stringify(options, undefined, 2));

    Logger.info("Creating files...");

    await createAllDirectoriesAndFilesFromTemplate(options);

    Logger.success("💪 Files created!");
  } catch (e) {
    Logger.error(e);
  }
};

run();
