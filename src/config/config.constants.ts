import { CLIArg, Options } from "../options";

export const CONFIG_FILE_NAME = "cfft.config.json";

export type ConfigTemplateOptions = Omit<
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

// This object is used for the default configuration in the cfft.config.json file
export const DEFAULT_CONFIG: Omit<Config, "path" | "folder"> = {
  defaultTemplateName: "component",
  templates: [
    {
      name: "component",
      options: {
        [CLIArg.TEMPLATE_PATH]: "/.cfft.templates/component",
        [CLIArg.DIR_PATH]: "./{fileName}",
        [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: "component",
        [CLIArg.TEXT_TO_BE_REPLACED]: "FileName",
        [CLIArg.REPLACE_TEXT_WITH]: "{fileName}",
        [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: true,
        [CLIArg.SHOULD_REPLACE_FILE_NAME]: true,
        [CLIArg.SEARCH_AND_REPLACE_SEPARATOR]: ";",
      },
    },
  ],
};
