import fs from "fs";
import path, { resolve } from "path";
import { promisify } from "util";
import { createFileAndWriteContent } from "./files";
import logger from "./logger";
import { CLIArg, Options } from "./options";

const CONFIG_FILE_NAME = "cfft.config.json";

type ConfigTemplateOptions = Omit<
  Options,
  CLIArg.FILE_NAME | CLIArg.TEMPLATE_NAME
>;

export interface TemplateConfig {
  name: string;
  options: Partial<ConfigTemplateOptions>;
}

export type Config = {
  defaultTemplateName: string;
  templates: TemplateConfig[];
  path: string;
  folder: string;
};

const DEFAULT_CONFIG: Omit<Config, "path" | "folder"> = {
  defaultTemplateName: "component",
  templates: [
    {
      name: "component",
      options: {
        [CLIArg.TEMPLATE_PATH]: "/cfft.templates/component",
        [CLIArg.DIR_PATH]: "./{fileName}",
        [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: "component",
        [CLIArg.TEXT_TO_BE_REPLACED]: "FileName",
        [CLIArg.REPLACE_TEXT_WITH]: "{fileName}",
        [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: true,
        [CLIArg.SHOULD_REPLACE_FILE_NAME]: true,
      },
    },
  ],
};

export const getConfig = async (): Promise<{
  config: Config;
  created: boolean;
}> => {
  const config = await findConfig();

  if (!config) {
    try {
      logger.info(
        `Couldn't find ${CONFIG_FILE_NAME}. Creating configuration...`
      );

      await createFileAndWriteContent(
        CONFIG_FILE_NAME,
        JSON.stringify(DEFAULT_CONFIG, undefined, 2)
      );

      logger.success(
        `⚙️  ${CONFIG_FILE_NAME} config file has been created: '${resolve(
          "."
        )}'`
      );
      return { config: await findConfig(), created: true };
    } catch (e) {
      logger.error("Error creating config file");

      throw e;
    }
  }

  return { config, created: false };
};

const findConfig = async (
  pathArg = ".",
  previousPath?: string
): Promise<Config> => {
  const searchPath = path.join(process.cwd(), pathArg, CONFIG_FILE_NAME);
  const folderPath = resolve(path.join(process.cwd(), pathArg));
  const currentPath = resolve(searchPath);

  if (currentPath === previousPath) return null as any;

  logger.debug(`Searching for config. Path: ${currentPath}`);

  try {
    const file = await promisify(fs.readFile)(searchPath);

    logger.debug(`Config file found: ${currentPath}`);

    const config = JSON.parse(file.toString()) as Config;
    config.folder = folderPath;
    config.path = currentPath;

    return config;
  } catch (error) {
    return await findConfig(path.join(pathArg, ".."), currentPath);
  }
};

export const getTemplateFromConfig = (config: Config, templateName: string) => {
  const template = config.templates.find((c) => c.name === templateName);

  if (!template) {
    throw Error(`Couldn't find template ${templateName}`);
  }

  return template;
};
