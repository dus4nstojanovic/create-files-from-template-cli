import { Answers } from "inquirer";
import { askConfirmQuestion, askInputQuestion } from "./questions";
import arg from "arg";
import { CLIArg, CLI_ARGS_TYPE } from "./args";

export const getHelper = () => {
  const args = Object.fromEntries(
    Object.entries(arg(CLI_ARGS_TYPE)).map(([key, value]) => [
      key,
      value === "true" ? true : value === "false" ? false : value,
    ])
  );

  const extractArg = (arg: CLIArg) => args[`--${arg}`];

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

  return {
    getInputArg,
    getConfirmArg,
    hasArg,
    extractArg,
    setArg,
  };
};
