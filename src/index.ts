import { AnswersTyped } from "./types";
import { getHelper } from "./helper";
import chalk from "chalk";
import { CLIArg } from "./args";
import { Answers } from "inquirer";

const getAnswers = async (): Promise<AnswersTyped> => {
  let answers: Answers = {};

  const helper = getHelper();
  const { hasArg, extractArg, getInputArg, getConfirmArg, setArg } = helper;

  answers = await getInputArg(CLIArg.FILE_NAME, "Enter file name:", answers);
  answers = await getInputArg(CLIArg.DIR_PATH, "Enter dir path:", answers);

  const hasTemplatePath = hasArg(CLIArg.TEMPLATE_PATH);

  if (!hasTemplatePath && extractArg(CLIArg.SHOULD_USE_TEMPLATE) !== false) {
    answers = await getConfirmArg(
      CLIArg.SHOULD_USE_TEMPLATE,
      "Should use template?",
      answers
    );
  } else {
    answers = setArg(CLIArg.SHOULD_USE_TEMPLATE, hasTemplatePath, answers);
  }

  if (answers[CLIArg.SHOULD_USE_TEMPLATE]) {
    answers = await getInputArg(
      CLIArg.TEMPLATE_PATH,
      "Enter template path:",
      answers
    );
  }

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
    }
  }

  return answers as AnswersTyped;
};

const run = async () => {
  try {
    const answers = await getAnswers();
  } catch (e) {
    console.log(chalk.red(e));
  }
};

run();
