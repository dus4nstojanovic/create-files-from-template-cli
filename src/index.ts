#!/usr/bin/env node

import { CLIArg, extractArg, getOptions } from "./options";
import { writeHelpTable } from "./help";
import { listTemplates } from "./list";
import { getOrCreateConfig } from "@beezydev/create-files-from-template-base/config";
import { createAllDirectoriesAndFilesFromTemplate } from "@beezydev/create-files-from-template-base/files";
import Logger from "@beezydev/create-files-from-template-base/logger";
import { overrideLogger } from "./logger.utils";

const run = async () => {
  overrideLogger();

  try {
    if (extractArg(CLIArg.VERSION)) {
      Logger.log(require("./package.json").version);
      return;
    }

    if (extractArg(CLIArg.HELP)) {
      writeHelpTable();
      return;
    }

    if (extractArg(CLIArg.LIST) || extractArg(CLIArg.LIST_DETAILED)) {
      listTemplates(extractArg(CLIArg.LIST_DETAILED));
      return;
    }

    Logger.success("create-files-cli has started");

    const { config, created } = await getOrCreateConfig(process.cwd());

    if (created) return;

    Logger.info("Retrieving options...");

    const options = await getOptions(config);

    Logger.success("✔ Options retrieved");

    Logger.info("Creating files...");

    await createAllDirectoriesAndFilesFromTemplate(process.cwd(), options);

    Logger.success("💪 Files created!");
  } catch (e) {
    Logger.error(e);
  }
};

run();
