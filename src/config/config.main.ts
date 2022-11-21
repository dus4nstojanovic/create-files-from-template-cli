import { resolve } from "path";
import { Config, CONFIG_FILE_NAME, DEFAULT_CONFIG, findConfig } from ".";
import { createFileAndWriteContent } from "../files";
import Logger from "../logger";

export const getOrCreateConfig = async (): Promise<{
  config: Config;
  created: boolean;
}> => {
  const config = await findConfig();

  if (!config) {
    try {
      Logger.info(
        `Couldn't find ${CONFIG_FILE_NAME}. Creating configuration...`
      );

      await createFileAndWriteContent(
        CONFIG_FILE_NAME,
        JSON.stringify(DEFAULT_CONFIG, undefined, 2)
      );

      Logger.success(
        `⚙️  ${CONFIG_FILE_NAME} config file has been created: '${resolve(
          "."
        )}'`
      );

      return { config: await findConfig(), created: true };
    } catch (e) {
      Logger.error("Error creating config file");
      throw e;
    }
  }

  return { config, created: false };
};

export const getTemplateFromConfig = (config: Config, templateName: string) => {
  const template = config.templates.find((c) => c.name === templateName);

  if (!template) {
    throw Error(`Couldn't find template ${templateName}`);
  }

  return template;
};
