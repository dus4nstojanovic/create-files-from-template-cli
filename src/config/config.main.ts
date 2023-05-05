import { TemplateConfig } from "./config.constants";
import { resolve } from "path";
import { Config, CONFIG_FILE_NAME, DEFAULT_CONFIG, findConfig } from ".";
import { createFileAndWriteContent } from "../files";
import Logger from "../logger";

/**
 * Parses the existing cfft.config.json configuration or creates it if it doesn't exist
 * @returns The parsed configuration configuration object
 */
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

/**
 * Finds the template configuration object by name and extracts it
 * @param config The configuration object
 * @param templateName The name of the template that should be extracted
 * @returns The template configuration object
 */
export const getTemplateFromConfig = (
  config: Config,
  templateName: string
): TemplateConfig | undefined =>
  config.templates?.find((c) => c.name === templateName);
