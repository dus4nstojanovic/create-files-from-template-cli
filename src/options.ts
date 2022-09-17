import { Answers } from "inquirer";
import { askConfirmQuestion, askInputQuestion } from "./questions";
import arg from "arg";
import { isBoolean } from "./validation";

export interface Options {
  [CLIArg.FILE_NAME]: string;
  [CLIArg.DIR_PATH]: string;
  [CLIArg.TEMPLATE_PATH]: string;
  [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: boolean;
  [CLIArg.SHOULD_REPLACE_FILE_NAME]: boolean;
  [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: string;
  [CLIArg.TEXT_TO_BE_REPLACED]: string;
  [CLIArg.REPLACE_TEXT_WITH]: string;
}

const enum CLIArg {
  FILE_NAME = "fileName",
  DIR_PATH = "dirPath",
  TEMPLATE_PATH = "templatePath",
  SHOULD_REPLACE_FILE_NAME = "shouldReplaceFileName",
  FILE_NAME_TEXT_TO_BE_REPLACED = "fileNameTextToBeReplaced",
  SHOULD_REPLACE_FILE_CONTENT = "shouldReplaceFileContent",
  TEXT_TO_BE_REPLACED = "textToBeReplaced",
  REPLACE_TEXT_WITH = "replaceTextWith",
  DEBUG = "debug",
}

const CLI_ARGS_TYPE = {
  "--fileName": String,
  "--dirPath": String,
  "--templatePath": String,
  "--shouldReplaceFileName": String,
  "--fileNameTextToBeReplaced": String,
  "--shouldReplaceFileContent": String,
  "--textToBeReplaced": String,
  "--replaceTextWith": String,
  "--debug": String,
};

const BOOLEAN_CLI_ARGS: CLIArg[] = [
  CLIArg.SHOULD_REPLACE_FILE_CONTENT,
  CLIArg.SHOULD_REPLACE_FILE_NAME,
  CLIArg.DEBUG,
];

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
  const result =
    answers[arg] !== undefined
      ? answers
      : await askCallback(arg, message, answers, defaultValue);

  if (arg !== CLIArg.FILE_NAME && typeof answers[arg] === "string") {
    answers[arg] = (answers[arg] as string).replace(
      "{fileName}",
      answers[CLIArg.FILE_NAME]
    );
  }

  return result;
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

  answers = await getInputArg(
    CLIArg.TEMPLATE_PATH,
    "Enter template path:",
    answers
  );

  // START - FILE NAME TEXT REPLACEMENT
  const hasFileNameTextToBeReplaced = hasArg(
    CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED
  );

  if (
    !hasFileNameTextToBeReplaced &&
    extractArg(CLIArg.SHOULD_REPLACE_FILE_NAME) !== false
  ) {
    answers = await getConfirmArg(
      CLIArg.SHOULD_REPLACE_FILE_NAME,
      "Should replace file name text?",
      answers
    );
  } else {
    answers = setArg(
      CLIArg.SHOULD_REPLACE_FILE_NAME,
      hasFileNameTextToBeReplaced,
      answers
    );
  }

  if (answers[CLIArg.SHOULD_REPLACE_FILE_NAME]) {
    answers = await getInputArg(
      CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED,
      "Enter file name text to be replaced:",
      answers
    );
  }
  // END - FILE NAME TEXT REPLACEMENT

  //START - FILE CONTENT TEXT REPLACEMENT
  const hasTextToBeReplaced = hasArg(CLIArg.TEXT_TO_BE_REPLACED);
  const shouldNotAskForReplaceTextWith =
    extractArg(CLIArg.SHOULD_REPLACE_FILE_CONTENT) === true &&
    !hasArg(CLIArg.REPLACE_TEXT_WITH);

  if (
    !hasTextToBeReplaced &&
    extractArg(CLIArg.SHOULD_REPLACE_FILE_CONTENT) !== false
  ) {
    answers = await getConfirmArg(
      CLIArg.SHOULD_REPLACE_FILE_CONTENT,
      "Should replace text?",
      answers
    );
  } else {
    answers = setArg(
      CLIArg.SHOULD_REPLACE_FILE_CONTENT,
      hasTextToBeReplaced,
      answers
    );
  }

  if (answers[CLIArg.SHOULD_REPLACE_FILE_CONTENT]) {
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

  //END - FILE CONTENT TEXT REPLACEMENT

  return answers as Options;
};

export const isDebug = (): boolean => extractArg(CLIArg.DEBUG) as boolean;
