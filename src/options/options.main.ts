import { Answers } from "inquirer";
import { Config, getTemplateFromConfig, TemplateConfig } from "../config";
import path from "path";
import {
  CLIArg,
  extractArg,
  getConfirmArg,
  getInputArg,
  hasArg,
  Options,
  setArg,
} from ".";

/**
 * Checks is the debug argument provided or not
 */
export const isDebug = (): boolean => extractArg(CLIArg.DEBUG) as boolean;

/**
 * Gets all option using the provided configuration, console arguments or inputs
 * @param config The configuration read from the cfft.config.json file
 * @returns All provided options
 */
export const getOptions = async (config: Config): Promise<Options> => {
  let answers: Answers = {};

  answers = await getTemplateName({ config, answers });

  const templateConfig = getTemplateFromConfig(
    config,
    (answers as Options)[CLIArg.TEMPLATE_NAME]
  );

  answers = await getFileName(answers);

  answers = await getDirPath({ templateConfig, answers });

  answers = await getTemplatePath({ config, templateConfig, answers });

  answers = await getFileNameTextReplacement({ templateConfig, answers });

  answers = await getFileContentTextReplacement({ templateConfig, answers });

  answers = getSearchAndReplaceCharater({ templateConfig, answers });

  return answers as Options;
};

const getTemplateName = async ({
  config,
  answers,
}: {
  config: Config;
  answers: Answers;
}): Promise<Answers> => {
  if (!config.defaultTemplateName || hasArg(CLIArg.TEMPLATE_NAME)) {
    answers = await getInputArg({
      arg: CLIArg.TEMPLATE_NAME,
      message: "Enter template name:",
      answers,
    });
  } else {
    answers = setArg(CLIArg.TEMPLATE_NAME, config.defaultTemplateName, answers);
  }

  return answers;
};

const getFileName = async (answers: Answers): Promise<Answers> => {
  answers = await getInputArg({
    arg: CLIArg.FILE_NAME,
    message: "Enter file name:",
    answers,
  });

  return answers;
};

const getDirPath = async ({
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig;
  answers: Answers;
}): Promise<Answers> => {
  answers = await getInputArg({
    arg: CLIArg.DIR_PATH,
    message: "Enter dir path:",
    answers,
    defaultValue: `./${answers[CLIArg.FILE_NAME]}`,
    templateConfig,
  });

  return answers;
};

const getTemplatePath = async ({
  config,
  templateConfig,
  answers,
}: {
  config: Config;
  templateConfig: TemplateConfig;
  answers: Answers;
}): Promise<Answers> => {
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

  return answers;
};

const getFileNameTextReplacement = async ({
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig;
  answers: Answers;
}): Promise<Answers> => {
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

  return answers;
};

const getFileContentTextReplacement = async ({
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig;
  answers: Answers;
}): Promise<Answers> => {
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

  return answers;
};

const getSearchAndReplaceCharater = ({
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig;
  answers: Answers;
}): Answers => {
  answers[CLIArg.SEARCH_AND_REPLACE_SEPARATOR] =
    (extractArg(CLIArg.SEARCH_AND_REPLACE_SEPARATOR) as string) ||
    templateConfig.options[CLIArg.SEARCH_AND_REPLACE_SEPARATOR] ||
    ";";

  return answers;
};
