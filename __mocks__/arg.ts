import { CLIArg } from "../src/options";

const providedArguments = {
  [`--${CLIArg.TEMPLATE_NAME}`]: "templateNameArgValue",
  [`--${CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED}`]:
    "fileNameTextToBeReplacedArgValue",
};

module.exports = () => {
  return providedArguments || {};
};
