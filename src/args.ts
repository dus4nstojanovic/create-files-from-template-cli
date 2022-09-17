export const enum CLIArg {
  FILE_NAME = "fileName",
  DIR_PATH = "dirPath",
  SHOULD_USE_TEMPLATE = "shouldUseTemplate",
  TEMPLATE_PATH = "templatePath",
  SHOULD_REPLACE = "shouldReplace",
  TEXT_TO_BE_REPLACED = "textToBeReplaced",
  REPLACE_TEXT_WITH = "replaceTextWith",
}

export const CLI_ARGS_TYPE = {
  "--fileName": String,
  "--dirPath": String,
  "--shouldUseTemplate": String,
  "--templatePath": String,
  "--shouldReplace": String,
  "--textToBeReplaced": String,
  "--replaceTextWith": String,
};
