import {
  Config,
  getTemplateFromConfig,
  TemplateConfig,
} from "@beezydev/create-files-from-template-base/config";
import {
  CLIArg,
  extractArg,
  getConfirmArg,
  getInputArg,
  hasArg,
  setArg,
} from ".";
import { Options } from "@beezydev/create-files-from-template-base/options";
import { Answers } from "../types";

/**
 * Gets all option using the provided configuration, console arguments or inputs
 * @param config The configuration read from the cfft.config.json file
 * @returns All provided options
 */
export const getOptions = async (config: Config): Promise<Options> => {
  let answers: Partial<Answers> = {};

  answers = await getTemplateName({ config, answers });

  const templateConfig = getTemplateFromConfig(
    config,
    (answers as Options)[CLIArg.TEMPLATE_NAME]
  );
  answers = await getFileName(answers);

  answers = await getDirPath({ templateConfig, answers });

  answers = await getTemplatePath({ templateConfig, answers });

  answers = await getFileNameTextReplacement({ templateConfig, answers });

  answers = await getFileContentTextReplacement({ templateConfig, answers });

  answers = getSearchAndReplaceCharacter({ templateConfig, answers });

  answers = getSearchAndReplaceItems({ templateConfig, answers });

  answers.hooksPath = templateConfig?.options?.hooksPath;

  answers.configDir = config.folder;

  return answers as Options;
};

const getSearchAndReplaceItems = ({
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig | undefined;
  answers: Partial<Answers>;
}) => {
  answers.searchAndReplace = templateConfig?.options?.searchAndReplace?.map(
    (sr) => ({
      ...sr,
      replace: sr.replace?.replace(
        new RegExp("{fileName}", "g"),
        answers[CLIArg.FILE_NAME] as string
      ),
    })
  );

  return answers;
};

const getTemplateName = async ({
  config,
  answers,
}: {
  config: Config;
  answers: Partial<Answers>;
}): Promise<Partial<Answers>> => {
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

const getFileName = async (
  answers: Partial<Answers>
): Promise<Partial<Answers>> => {
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
  templateConfig: TemplateConfig | undefined;
  answers: Partial<Answers>;
}): Promise<Partial<Answers>> => {
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
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig | undefined;
  answers: Partial<Answers>;
}): Promise<Partial<Answers>> => {
  answers = await getInputArg({
    arg: CLIArg.TEMPLATE_PATH,
    message: "Enter template path:",
    answers,
    templateConfig,
  });

  return answers;
};

const getFileNameTextReplacement = async ({
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig | undefined;
  answers: Partial<Answers>;
}): Promise<Partial<Answers>> => {
  const hasFileNameTextToBeReplaced =
    hasArg(CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED) ||
    templateConfig?.options?.[CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED];

  const shouldAskForReplaceFileName =
    extractArg(CLIArg.SHOULD_REPLACE_FILE_NAME) !== false &&
    templateConfig?.options?.[CLIArg.SHOULD_REPLACE_FILE_NAME] !== false;

  if (!hasFileNameTextToBeReplaced && shouldAskForReplaceFileName) {
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
  templateConfig: TemplateConfig | undefined;
  answers: Partial<Answers>;
}): Promise<Partial<Answers>> => {
  const hasSearchAndReplaceItems =
    !!templateConfig?.options?.searchAndReplace?.length;

  const hasTextToBeReplaced =
    hasArg(CLIArg.TEXT_TO_BE_REPLACED) ||
    !!templateConfig?.options?.[CLIArg.TEXT_TO_BE_REPLACED] ||
    hasSearchAndReplaceItems;

  const shouldAskForReplaceFileContent =
    templateConfig?.options?.[CLIArg.SHOULD_REPLACE_FILE_CONTENT] !== false &&
    extractArg(CLIArg.SHOULD_REPLACE_FILE_CONTENT) !== false &&
    !hasSearchAndReplaceItems;

  const shouldNotAskForReplaceTextWith =
    extractArg(CLIArg.SHOULD_REPLACE_FILE_CONTENT) === true &&
    (!hasArg(CLIArg.REPLACE_TEXT_WITH) ||
      !templateConfig?.options?.[CLIArg.REPLACE_TEXT_WITH]);

  if (!hasTextToBeReplaced && shouldAskForReplaceFileContent) {
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
      shouldAsk: !hasSearchAndReplaceItems,
    });

    if (!shouldNotAskForReplaceTextWith) {
      answers = await getInputArg({
        arg: CLIArg.REPLACE_TEXT_WITH,
        message: `Replace text with:`,
        answers,
        defaultValue: answers[CLIArg.FILE_NAME],
        templateConfig,
        shouldAsk: !hasSearchAndReplaceItems,
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

const getSearchAndReplaceCharacter = ({
  templateConfig,
  answers,
}: {
  templateConfig: TemplateConfig | undefined;
  answers: Partial<Answers>;
}): Partial<Answers> => {
  answers[CLIArg.SEARCH_AND_REPLACE_SEPARATOR] =
    (extractArg(CLIArg.SEARCH_AND_REPLACE_SEPARATOR) as string) ||
    templateConfig?.options?.[CLIArg.SEARCH_AND_REPLACE_SEPARATOR] ||
    ";";

  return answers;
};
