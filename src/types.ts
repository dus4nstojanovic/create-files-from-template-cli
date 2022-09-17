import { CLIArg } from "./args";

export interface AnswersTyped {
  [CLIArg.FILE_NAME]: string;
  [CLIArg.DIR_PATH]: string;
  [CLIArg.SHOULD_USE_TEMPLATE]: boolean;
  [CLIArg.TEMPLATE_PATH]: string;
  [CLIArg.SHOULD_REPLACE]: boolean;
  [CLIArg.TEXT_TO_BE_REPLACED]: string;
  [CLIArg.REPLACE_TEXT_WITH]: string;
}
