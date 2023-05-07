import { format } from "date-fns";
import { SearchAndReplaceItem } from "../config";
import { readFileContent } from "./files.utils";
import Logger from "../logger";
import path from "path";
import {
  DEFAULT_REPLACE_TEXT_WITH_ORDER,
  DEFAULT_SEARCH_AND_REPLACE_ORDER,
} from "../constants";
import { CLIArg, Options } from "../options";

/**
Creates SearchAndReplaceItem[] array from the textToBeReplaced, replaceTextWith and other search and replace items, sortihing them by orders
@returns The SearchAndReplaceItem array.
*/
export const createSearchAndReplaceItemsFromArgs = ({
  textToBeReplaced,
  replaceTextWith,
  searchAndReplaceSeparator,
  searchAndReplace = [],
}: Pick<
  Options,
  | CLIArg.TEXT_TO_BE_REPLACED
  | CLIArg.REPLACE_TEXT_WITH
  | CLIArg.SEARCH_AND_REPLACE_SEPARATOR
  | "searchAndReplace"
>): SearchAndReplaceItem[] => {
  const textToBeReplacedSplitted =
    textToBeReplaced?.split(searchAndReplaceSeparator) || [];

  const replaceTextWithSplitted =
    replaceTextWith?.split(searchAndReplaceSeparator) || [];

  if (textToBeReplacedSplitted.length !== replaceTextWithSplitted.length) {
    throw new Error(
      "textToBeReplaced and replaceTextWith arguments length mismatch!"
    );
  }

  const replaceTextWithSearchAndReplaceItems = textToBeReplacedSplitted.map(
    (search, i) => ({
      search,
      replace: replaceTextWithSplitted[i],
      order: DEFAULT_REPLACE_TEXT_WITH_ORDER,
    })
  );

  searchAndReplace = searchAndReplace?.map((sr) => ({
    ...sr,
    order: sr.order || DEFAULT_SEARCH_AND_REPLACE_ORDER,
  }));

  const result: SearchAndReplaceItem[] = [
    ...replaceTextWithSearchAndReplaceItems,
    ...searchAndReplace,
  ];

  return result.sort((a, b) => (a.order && b.order ? a.order - b.order : 0));
};

/**
Replaces file content parts using the provided SearchAndReplace items.
@returns The replaced file content.
*/
export const replaceSearchItems = async ({
  searchAndReplaceItems,
  fileName,
  configDir,
  fileContent,
}: {
  searchAndReplaceItems: SearchAndReplaceItem[];
  fileName: string;
  configDir: string;
  fileContent: string;
}) => {
  for (let {
    search,
    replace,
    ignoreCase,
    injectFile,
  } of searchAndReplaceItems) {
    Logger.debug(
      `Replacing ${search} with ${replace} in file ${fileName}. Options: ${{
        search,
        replace,
        ignoreCase,
        injectFile,
      }}`
    );

    let flags = "g";

    if (ignoreCase) flags += "i";

    if (injectFile) {
      const injectFilePath = path.join(configDir, replace);

      Logger.debug(`Reading file to inject: ${injectFilePath}`);

      replace = await readFileContent(injectFilePath);
    }

    fileContent = fileContent.replace(new RegExp(search, flags), replace);
  }

  return fileContent;
};

/**
Replaces all occurrences of {env:variableName} in the input string with the value of the corresponding environment variable.
@param text - The input string to search and replace.
@returns The input string with all occurrences of {env:variableName} replaced with the corresponding environment variable value, or the original string if the variable is not defined.
*/
export const replaceEnvVariables = (text: string): string => {
  // Regular expression pattern to match {env:variableName} tags
  const pattern = /\{env:([^\}]+)\}/g;

  return text.replace(pattern, (match, envVarName) => {
    const envVarValue = process.env[envVarName];
    const valueFound = envVarValue !== undefined;

    if (valueFound) {
      Logger.debug(
        `Replacing environment variable tag ${match} with environment variable ${envVarName} with value: ${envVarValue}`
      );

      return envVarValue;
    } else {
      Logger.warning(`Environment variable ${envVarName} not found!`);

      return match;
    }
  });
};

/**
Replaces all occurrences of {dateTimeNow:format} in the input string with the current date and time formatted using the specified format.
@param text - The input string to search and replace.
@returns The input string with all occurrences of {dateTimeNow:format} replaced with the current date and time formatted using the specified format.
*/
export const replaceDateTime = (text: string): string => {
  // Regular expression pattern to match {dateTimeNow:format} tags
  const pattern = /\{dateTimeNow:([^\}]+)\}/g;

  const dateNow = new Date();

  return text.replace(pattern, (match, dateTimeNowFormat) => {
    const result = format(dateNow, dateTimeNowFormat);

    Logger.debug(
      `Replacing dateTimeNow tag ${match} with the current date and time using the format ${dateTimeNowFormat} with value: ${result}`
    );

    return result;
  });
};
