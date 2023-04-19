export interface Options {
  [CLIArg.TEMPLATE_NAME]: string;
  [CLIArg.FILE_NAME]: string;
  [CLIArg.DIR_PATH]: string;
  [CLIArg.TEMPLATE_PATH]: string;
  [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: boolean;
  [CLIArg.SHOULD_REPLACE_FILE_NAME]: boolean;
  [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: string;
  [CLIArg.TEXT_TO_BE_REPLACED]: string;
  [CLIArg.REPLACE_TEXT_WITH]: string;
  [CLIArg.SEARCH_AND_REPLACE_SEPARATOR]: string;
}

export const enum CLIArg {
  FILE_NAME = "fileName",
  DIR_PATH = "dirPath",
  TEMPLATE_NAME = "template",
  TEMPLATE_PATH = "templatePath",
  SHOULD_REPLACE_FILE_NAME = "shouldReplaceFileName",
  FILE_NAME_TEXT_TO_BE_REPLACED = "fileNameTextToBeReplaced",
  SHOULD_REPLACE_FILE_CONTENT = "shouldReplaceFileContent",
  TEXT_TO_BE_REPLACED = "textToBeReplaced",
  REPLACE_TEXT_WITH = "replaceTextWith",
  SEARCH_AND_REPLACE_SEPARATOR = "searchAndReplaceSeparator",
  DEBUG = "debug",
  VERSION = "version",
  HELP = "help",
}

export const enum CLIArgAlias {
  FILE_NAME = "n",
  TEMPLATE_NAME = "t",
  VERSION = "v",
}

export const CLI_ARGS_TYPE = {
  "--fileName": String,
  "--dirPath": String,
  "--template": String,
  "--templatePath": String,
  "--shouldReplaceFileName": String,
  "--fileNameTextToBeReplaced": String,
  "--shouldReplaceFileContent": String,
  "--textToBeReplaced": String,
  "--replaceTextWith": String,
  "--searchAndReplaceSeparator": String,
  "--debug": String,
  "--version": Boolean,
  "--help": Boolean,

  // Aliases
  "-n": "--fileName",
  "-t": "--template",
  "-v": "--version",
};

export const BOOLEAN_CLI_ARGS: CLIArg[] = [
  CLIArg.SHOULD_REPLACE_FILE_CONTENT,
  CLIArg.SHOULD_REPLACE_FILE_NAME,
  CLIArg.DEBUG,
];
