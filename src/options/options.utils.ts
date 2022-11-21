import { Answers } from "inquirer";
import { askConfirmQuestion, askInputQuestion } from "../questions";
import arg from "arg";
import { isBoolean } from "../validation";
import { TemplateConfig } from "../config";
import { BOOLEAN_CLI_ARGS, CLIArg, CLI_ARGS_TYPE } from ".";

/**
 * Sets the argument and its value
 * @param arg The argument name to be set
 * @param value The value to be set
 * @param answers The current answers
 * @returns The updated answers
 */
export const setArg = (arg: CLIArg, value: any, answers: Answers): Answers => {
  answers[arg] = value;
  return answers;
};

/**
 * Gets an input (text) arg
 * @param args.arg The argument name to be set
 * @param args.message The question to be asked
 * @param args.answers The current answers
 * @param args.templateConfig The selected template configuration
 * @param args.defaultValue The default value to be used if none is provided
 * @returns The updated answers
 */
export const getInputArg = (args: {
  arg: CLIArg;
  message: string;
  answers: Answers;
  templateConfig?: TemplateConfig;
  defaultValue?: any;
}): Promise<Answers> =>
  getArg({
    ...args,
    askCallback: askInputQuestion,
    templateConfig: args?.templateConfig,
  });

/**
 * Gets a confirmation (yes/no) arg
 * @param args.arg The argument name to be set
 * @param args.message The question to be asked
 * @param args.answers The current answers
 * @param args.templateConfig The selected template configuration
 * @param args.defaultValue The default value to be used if none is provided
 * @returns The updated answers
 */
export const getConfirmArg = (args: {
  arg: CLIArg;
  message: string;
  answers: Answers;
  templateConfig?: TemplateConfig;
  defaultValue?: any;
}): Promise<Answers> =>
  getArg({
    ...args,
    askCallback: askConfirmQuestion,
    templateConfig: args?.templateConfig,
  });

/**
 * Extracts an argument
 * @param arg The argument name
 * @returns The argument value
 */
export const extractArg = (arg: CLIArg) => getArgs()[`--${arg}`];

/**
 * Checks for the argument value
 * @param arg The argument name
 */
export const hasArg = (arg: CLIArg): boolean => !!extractArg(arg);

const getArgs = (): Answers => {
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

const getAnswerFromArgs = (arg: CLIArg, answers: Answers): Answers => {
  const value = extractArg(arg);
  if (value) answers[arg] = value;
  return answers;
};

const getAnswerFromConfig = (
  arg: CLIArg,
  templateConfig: TemplateConfig | undefined,
  answers: Answers
): Answers => {
  const configValue = templateConfig?.options?.[arg];

  if (configValue) {
    answers[arg] = configValue;
  }

  return answers;
};

/**
 * Gets the argument in the following priority (Args -> Configuratin -> Question and Answer)
 * @param param.arg The argument name
 * @param args.message The question to be asked
 * @param param.askCallback The callback with the question
 * @param args.answers The current answers
 * @param args.defaultValue The default value to be used if none is provided
 * @param args.templateConfig The selected template configuration
 * @returns The updated answers
 */
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
  // Arguments have the priority
  answers = getAnswerFromArgs(arg, answers);

  // If answer was not provided, get the answer from the configuration file (cfft.config.json)
  if (answers[arg] === undefined) {
    answers = getAnswerFromConfig(arg, templateConfig, answers);
  }

  // If answer was not provided in arguments and configuration, ask for it
  if (answers[arg] === undefined) {
    answers = await askCallback(arg, message, answers, defaultValue);
  }

  // Replace the {fileName} with the fileName answer (value)
  const shouldReplace =
    arg !== CLIArg.FILE_NAME && typeof answers[arg] === "string";
  if (shouldReplace) {
    answers[arg] = (answers[arg] as string).replace(
      new RegExp("{fileName}", "g"),
      answers[CLIArg.FILE_NAME]
    );
  }

  return answers;
};
