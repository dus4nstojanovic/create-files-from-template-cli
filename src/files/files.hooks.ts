import Logger from "../logger";
import path from "path";
import { CLIArg, Options } from "../options";

/**
Executes the onFileCreated hook if available from the specified hooks file
@param {object} options - Options object containing configDir, hooksPath, filePath and templatePath
@param {string} options.configDir - The directory where the configuration file is located
@param {string} options.hooksPath - The path to the hooks file
@param {string} options.filePath - The path to the created file
@param {string} options.templatePath - The path to the template file used to create the file
@throws {Error} If the hooks file is not found
*/
export const onFileCreatedHook = ({
  configDir,
  hooksPath,
  filePath,
  templatePath,
}: Pick<Options, "configDir" | "hooksPath" | CLIArg.TEMPLATE_PATH> & {
  filePath: string;
}) => {
  if (!hooksPath) return;

  let hooks;

  const absolutePath = path.join(configDir, hooksPath);
  const relativeHooksPath = path.relative(__dirname, absolutePath);

  try {
    hooks = require(relativeHooksPath);
  } catch (e) {
    throw new Error(`Hooks file not found. Path: ${absolutePath}`);
  }

  try {
    if (hooks.onFileCreated) {
      hooks.onFileCreated({ filePath, templatePath });
      Logger.debug(`onFileCreated executed correctly for file: ${filePath}`);
    } else {
      Logger.debug(`onFileCreated is not found in file: ${absolutePath}`);
    }
  } catch (e) {
    Logger.error("Error executing onFileCreated hook", e);
  }
};
