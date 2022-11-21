import { Answers } from "inquirer";
import { askConfirmQuestion, askInputQuestion } from "../questions";
import arg from "arg";
import { isBoolean } from "../validation";
import { TemplateConfig } from "../config";
import { BOOLEAN_CLI_ARGS, CLIArg, CLI_ARGS_TYPE } from ".";

export const setArg = (arg: CLIArg, value: any, answers: Answers) => {
  answers[arg] = value;
  return answers;
};

export const getInputArg = (args: {
  arg: CLIArg;
  message: string;
  answers: Answers;
  templateConfig?: TemplateConfig;
  defaultValue?: any;
}) =>
  getArg({
    ...args,
    askCallback: askInputQuestion,
    templateConfig: args?.templateConfig,
  });

export const getConfirmArg = (args: {
  arg: CLIArg;
  message: string;
  answers: Answers;
  templateConfig?: TemplateConfig;
  defaultValue?: any;
}) =>
  getArg({
    ...args,
    askCallback: askConfirmQuestion,
    templateConfig: args?.templateConfig,
  });

export const extractArg = (arg: CLIArg) => getArgs()[`--${arg}`];

export const hasArg = (arg: CLIArg) => !!extractArg(arg);

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
      new RegExp("{fileName}", "g"),
      answers[CLIArg.FILE_NAME]
    );
  }

  return answers;
};
