import { Answers } from "inquirer";
import { askConfirmQuestion, askInputQuestion } from "./questions";
import arg from "arg";
import { isBoolean } from "./validation";

export interface Options {
  [CLIArg.FILE_NAME]: string;
  [CLIArg.DIR_PATH]: string;
  [CLIArg.TEMPLATE_PATH]: string;
  [CLIArg.SHOULD_REPLACE]: boolean;
  [CLIArg.TEXT_TO_BE_REPLACED]: string;
  [CLIArg.REPLACE_TEXT_WITH]: string;
}

const enum CLIArg {
  FILE_NAME = "fileName",
  DIR_PATH = "dirPath",
  TEMPLATE_PATH = "templatePath",
  SHOULD_REPLACE = "shouldReplace",
  TEXT_TO_BE_REPLACED = "textToBeReplaced",
  REPLACE_TEXT_WITH = "replaceTextWith",
  DEBUG = "debug",
}

const CLI_ARGS_TYPE = {
  "--fileName": String,
  "--dirPath": String,
  "--shouldUseTemplate": String,
  "--templatePath": String,
  "--shouldReplace": String,
  "--textToBeReplaced": String,
  "--replaceTextWith": String,
  "--debug": String,
};

const BOOLEAN_CLI_ARGS: CLIArg[] = [CLIArg.SHOULD_REPLACE, CLIArg.DEBUG];

const getArgs = () => {
  const args = Object.fromEntries(
    Object.entries(arg(CLI_ARGS_TYPE)).map(([key, value]) => [
      key,
      value === "true" ? true : value === "false" ? false : value,
    ])
  );

  BOOLEAN_CLI_ARGS.forEach((booleanArg) => {
    if (args[booleanArg] && !isBoolean(args[booleanArg])) {
      throw new Error(
        `The expected value type for the '${booleanArg}' is Boolean (true/false), but the provided value was ${args[booleanArg]}`
      );
    }
  });

  return args;
};

const extractArg = (arg: CLIArg) => getArgs()[`--${arg}`];

const setArg = (arg: CLIArg, value: any, answers: Answers) => {
  answers[arg] = value;
  return answers;
};

const getAnswerFromArgs = (arg: CLIArg, answers: Answers) => {
  const value = extractArg(arg);
  if (value) answers[arg] = value;
  return answers;
};

const getArg = async ({
  arg,
  message,
  askCallback,
  answers,
  defaultValue,
}: {
  arg: CLIArg;
  message: string;
  askCallback: (
    name: string,
    message: string,
    answers: Answers,
    defaultValue?: any
  ) => Promise<Answers>;
  answers: Answers;
  defaultValue?: any;
}): Promise<Answers> => {
  answers = getAnswerFromArgs(arg, answers);
  return answers[arg] !== undefined
    ? answers
    : await askCallback(arg, message, answers, defaultValue);
};

const getInputArg = (
  arg: CLIArg,
  message: string,
  answers: Answers,
  defaultValue?: any
) =>
  getArg({
    arg,
    message,
    askCallback: askInputQuestion,
    answers,
    defaultValue,
  });

const getConfirmArg = (
  arg: CLIArg,
  message: string,
  answers: Answers,
  defaultValue?: any
) =>
  getArg({
    arg,
    message,
    askCallback: askConfirmQuestion,
    answers,
    defaultValue,
  });

const hasArg = (arg: CLIArg) => !!extractArg(arg);

export const getOptions = async (): Promise<Options> => {
  let answers: Answers = {};

  answers = await getInputArg(CLIArg.FILE_NAME, "Enter file name:", answers);
  answers = await getInputArg(
    CLIArg.DIR_PATH,
    "Enter dir path:",
    answers,
    `./${answers[CLIArg.FILE_NAME]}`
  );

  answers[CLIArg.DIR_PATH] = answers[CLIArg.DIR_PATH].replace(
    "{fileName}",
    answers[CLIArg.FILE_NAME]
  );

  answers = await getInputArg(
    CLIArg.TEMPLATE_PATH,
    "Enter template path:",
    answers
  );

  const hasTextToBeReplaced = hasArg(CLIArg.TEXT_TO_BE_REPLACED);
  const shouldNotAskForReplaceTextWith =
    extractArg(CLIArg.SHOULD_REPLACE) === true &&
    !hasArg(CLIArg.REPLACE_TEXT_WITH);

  if (!hasTextToBeReplaced && extractArg(CLIArg.SHOULD_REPLACE) !== false) {
    answers = await getConfirmArg(
      CLIArg.SHOULD_REPLACE,
      "Should replace text?",
      answers
    );
  } else {
    answers = setArg(CLIArg.SHOULD_REPLACE, hasTextToBeReplaced, answers);
  }

  if (answers[CLIArg.SHOULD_REPLACE]) {
    answers = await getInputArg(
      CLIArg.TEXT_TO_BE_REPLACED,
      "Enter text to be replaced:",
      answers
    );

    if (!shouldNotAskForReplaceTextWith) {
      answers = await getInputArg(
        CLIArg.REPLACE_TEXT_WITH,
        `Replace text with:`,
        answers,
        answers[CLIArg.FILE_NAME]
      );
    } else {
      answers = setArg(
        CLIArg.REPLACE_TEXT_WITH,
        answers[CLIArg.FILE_NAME],
        answers
      );
    }
  }

  return answers as Options;
};

export const isDebug = (): boolean => extractArg(CLIArg.DEBUG) as boolean;
