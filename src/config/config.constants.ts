import { CLIArg, Options } from "../options";

export const CONFIG_FILE_NAME = "cfft.config.json";

export type SearchAndReplaceItem = {
  search: string;
  replace: string;
  ignoreCase?: boolean;
  injectFile?: boolean;
  order?: number;
};

export type ConfigOnlyOptions = {
  searchAndReplace: SearchAndReplaceItem[];
  hooksPath: string;
};

export type ConfigTemplateOptions = Omit<
  Options,
  CLIArg.FILE_NAME | CLIArg.TEMPLATE_NAME
> &
  ConfigOnlyOptions;

export type TemplateConfig = {
  name: string;
  description?: string;
  options: Partial<ConfigTemplateOptions>;
};

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
        searchAndReplace: [{ search: "FileName", replace: "{fileName}" }],
      },
    },
  ],
};
