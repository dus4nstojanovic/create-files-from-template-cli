import { Answers } from "inquirer";
import { askConfirmQuestion, askInputQuestion } from "./questions";
import arg from "arg";
import { isBoolean } from "./validation";
import { Config, getTemplateFromConfig, TemplateConfig } from "./config";
import path from "path";

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
  DEBUG = "debug",
}

const CLI_ARGS_TYPE = {
  "--fileName": String,
  "--dirPath": String,
  "--template": String,
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

const getAnswerFromConfig = (
  arg: CLIArg,
  templateConfig: TemplateConfig | undefined,
  answers: Answers
) => {
  const configValue = templateConfig?.options?.[arg];

  if (configValue) {
    answers[arg] = configValue;
  }

  return answers;
};

const getArg = async ({
  arg,
  message,
  askCallback,
  answers,
  defaultValue,
  templateConfig,
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
  templateConfig: TemplateConfig | undefined;
}): Promise<Answers> => {
  answers = getAnswerFromArgs(arg, answers);

  answers =
    answers[arg] !== undefined
      ? answers
      : getAnswerFromConfig(arg, templateConfig, answers);

  if (answers[arg] === undefined) {
    answers = await askCallback(arg, message, answers, defaultValue);
  }

  if (arg !== CLIArg.FILE_NAME && typeof answers[arg] === "string") {
    answers[arg] = (answers[arg] as string).replace(
      "{fileName}",
      answers[CLIArg.FILE_NAME]
    );
  }

  return answers;
};

const getInputArg = ({
  arg,
  message,
  answers,
  templateConfig,
  defaultValue,
}: {
  arg: CLIArg;
  message: string;
  answers: Answers;
  templateConfig?: TemplateConfig;
  defaultValue?: any;
}) =>
  getArg({
    arg,
    message,
    askCallback: askInputQuestion,
    answers,
    templateConfig,
    defaultValue,
  });

const getConfirmArg = ({
  arg,
  message,
  answers,
  templateConfig,
  defaultValue,
}: {
  arg: CLIArg;
  message: string;
  answers: Answers;
  templateConfig?: TemplateConfig;
  defaultValue?: any;
}) =>
  getArg({
    arg,
    message,
    askCallback: askConfirmQuestion,
    answers,
    templateConfig,
    defaultValue,
  });

const hasArg = (arg: CLIArg) => !!extractArg(arg);

export const getOptions = async (config: Config): Promise<Options> => {
  let answers: Answers = {};

  if (!config.defaultTemplateName || hasArg(CLIArg.TEMPLATE_NAME)) {
    answers = await getInputArg({
      arg: CLIArg.TEMPLATE_NAME,
      message: "Enter template name:",
      answers,
    });
  } else {
    answers = setArg(CLIArg.TEMPLATE_NAME, config.defaultTemplateName, answers);
  }

  const templateConfig = getTemplateFromConfig(
    config,
    (answers as Options)[CLIArg.TEMPLATE_NAME]
  );

  answers = await getInputArg({
    arg: CLIArg.FILE_NAME,
    message: "Enter file name:",
    answers,
  });

  answers = await getInputArg({
    arg: CLIArg.DIR_PATH,
    message: "Enter dir path:",
    answers,
    defaultValue: `./${answers[CLIArg.FILE_NAME]}`,
    templateConfig,
  });

  // START - TEMPLATE PATH
  answers = await getInputArg({
    arg: CLIArg.TEMPLATE_PATH,
    message: "Enter template path:",
    answers,
    templateConfig,
  });

  if (answers[CLIArg.TEMPLATE_PATH].startsWith("/")) {
    answers[CLIArg.TEMPLATE_PATH] = path.join(
      config.folder,
      answers[CLIArg.TEMPLATE_PATH]
    );
  }
  // END - TEMPLATE PATH

  // START - FILE NAME TEXT REPLACEMENT
  const hasFileNameTextToBeReplaced =
    hasArg(CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED) ||
    templateConfig.options[CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED];

  if (
    !hasFileNameTextToBeReplaced &&
    extractArg(CLIArg.SHOULD_REPLACE_FILE_NAME) !== false
  ) {
    answers = await getConfirmArg({
      arg: CLIArg.SHOULD_REPLACE_FILE_NAME,
      message: "Should replace file name text?",
      answers,
      templateConfig,
    });
  } else {
    answers = setArg(
      CLIArg.SHOULD_REPLACE_FILE_NAME,
      hasFileNameTextToBeReplaced,
      answers
    );
  }

  if (answers[CLIArg.SHOULD_REPLACE_FILE_NAME]) {
    answers = await getInputArg({
      arg: CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED,
      message: "Enter file name text to be replaced:",
      answers,
      templateConfig,
    });
  }
  // END - FILE NAME TEXT REPLACEMENT

  //START - FILE CONTENT TEXT REPLACEMENT

  const hasTextToBeReplaced =
    hasArg(CLIArg.TEXT_TO_BE_REPLACED) ||
    templateConfig.options[CLIArg.TEXT_TO_BE_REPLACED];

  const shouldNotAskForReplaceTextWith =
    extractArg(CLIArg.SHOULD_REPLACE_FILE_CONTENT) === true &&
    (!hasArg(CLIArg.REPLACE_TEXT_WITH) ||
      !templateConfig.options[CLIArg.REPLACE_TEXT_WITH]);

  if (
    !hasTextToBeReplaced &&
    extractArg(CLIArg.SHOULD_REPLACE_FILE_CONTENT) !== false
  ) {
    answers = await getConfirmArg({
      arg: CLIArg.SHOULD_REPLACE_FILE_CONTENT,
      message: "Should replace text?",
      answers,
      templateConfig,
    });
  } else {
    answers = setArg(
      CLIArg.SHOULD_REPLACE_FILE_CONTENT,
      hasTextToBeReplaced,
      answers
    );
  }

  if (answers[CLIArg.SHOULD_REPLACE_FILE_CONTENT]) {
    answers = await getInputArg({
      arg: CLIArg.TEXT_TO_BE_REPLACED,
      message: "Enter text to be replaced:",
      answers,
      templateConfig,
    });

    if (!shouldNotAskForReplaceTextWith) {
      answers = await getInputArg({
        arg: CLIArg.REPLACE_TEXT_WITH,
        message: `Replace text with:`,
        answers,
        defaultValue: answers[CLIArg.FILE_NAME],
        templateConfig,
      });
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
