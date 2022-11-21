import fs from "fs";
import path, { resolve } from "path";
import { promisify } from "util";
import { Config, CONFIG_FILE_NAME } from ".";
import Logger from "../logger";

/**
 * Searches for the configuration file. If the file isn't found, searches in the parent directory
 * @param pathArg The path of the configuration file
 * @param previousPath The previous (parent) path
 * @returns The parsed configuration file (used in the recursion)
 */
export const findConfig = async (
  pathArg = ".",
  previousPath?: string
): Promise<Config> => {
  const searchPath = path.join(process.cwd(), pathArg, CONFIG_FILE_NAME);
  const folderPath = resolve(path.join(process.cwd(), pathArg));
  const currentPath = resolve(searchPath);

  if (currentPath === previousPath) return null as any;

  Logger.debug(`Searching for config. Path: ${currentPath}`);

  try {
    const file = await promisify(fs.readFile)(searchPath);

    Logger.debug(`Config file found: ${currentPath}`);

    const config = JSON.parse(file.toString()) as Config;
    config.folder = folderPath;
    config.path = currentPath;

    return config;
  } catch (error) {
    return await findConfig(path.join(pathArg, ".."), currentPath);
  }
};
