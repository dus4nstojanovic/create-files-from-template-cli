import fs from "fs";
import path from "path";
import { promisify } from "util";
import Logger from "../logger";
import { CLIArg, Options } from "../options";
import { SearchAndReplaceItem } from "../config";
import {
  DEFAULT_REPLACE_TEXT_WITH_ORDER,
  DEFAULT_SEARCH_AND_REPLACE_ORDER,
} from "../constants";
import { format } from "date-fns";

/**
 * Adjusts the provided path
 * @param pathArg The path to be adjusted
 * @returns An absolute path if it starts with ./ or ../, or the relative path if it starts with /
 */
export const createPath = (pathArg: string) =>
  pathArg.startsWith("/")
    ? pathArg
    : path.join(process.cwd(), ...pathArg.split("/"));

/**
 * Gets paths of directory's items
 * @param dirPath The directory path (parent)
 * @returns Paths of directories and files
 */
export const getInnerDirectoriesAndFilesPaths = async (dirPath: string) => {
  try {
    const files = await promisify(fs.readdir)(dirPath);
    return files.map((file) => `${dirPath}/${file}`);
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't get files paths from folder: '${dirPath}'`);
  }
};

/**
 * Creates a file and writes its content
 * @param pathArg The path of the file
 * @param content The content to write
 */
export const createFileAndWriteContent = async (
  pathArg: string,
  content: string
) => {
  try {
    await promisify(fs.writeFile)(pathArg, content);
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't create file: '${pathArg}'`);
  }
};

/**
 * Reads the file content
 * @param pathArg The path of the file
 * @returns The file content
 */
export const readFileContent = async (pathArg: string): Promise<string> => {
  try {
    return (await promisify(fs.readFile)(pathArg)).toString();
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't read file content from path: '${pathArg}'`);
  }
};

/**
 * Creates a directory on the specified path
 * @param path The path to the directory
 */
export const createDirectory = async (
  path: string
): Promise<string | undefined> => {
  try {
    return await promisify(fs.mkdir)(path, { recursive: true });
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't create directory for path: '${path}'`);
  }
};

/**
 * Checks the item to determine if is it a directory or not
 * @param path The path to the item
 * @returns Is it a directory or not
 */
export const isDirectory = (path: string): boolean => {
  try {
    return fs.lstatSync(path).isDirectory();
  } catch (e) {
    Logger.debug(e);
    throw new Error(
      `Couldn't determine if the provided path is a directory: '${path}'`
    );
  }
};

/**
 * Creates a file, or directory with children using the provided options
 * @param args Options for the file/directory creation
 * @returns
 */
export const createFileOrDirectoryFromTemplate = async (
  args: Options
): Promise<void> => {
  if (isDirectory(args.templatePath)) {
    await createDirectoryFromTemplate(args);
    return;
  }

  await createFileFromTemplate(args);
};

const createDirectoryFromTemplate = async (args: Options): Promise<void> => {
  const { filePath } = createFilePathAndNameFromTemplate({
    templatePath: args.templatePath,
    shouldReplaceFileName: args.shouldReplaceFileName,
    fileNameTextToBeReplaced: args.fileNameTextToBeReplaced,
    dirPath: args.dirPath,
    fileName: args.fileName,
  });

  const { templatePath, fileName } = args;
  Logger.debug("Creating inner directory:", filePath);

  await createDirectory(filePath);

  Logger.info("Inner directory created:", filePath);

  const templateFilesPaths = await getInnerDirectoriesAndFilesPaths(
    templatePath
  );

  Logger.debug("Inner template paths:", templateFilesPaths);

  await Promise.all(
    templateFilesPaths.map((templateFilePath) =>
      createFileOrDirectoryFromTemplate({
        ...args,
        templatePath: templateFilePath,
        dirPath: filePath,
        fileName,
      })
    )
  );
};

const createFileFromTemplate = async ({
  templatePath,
  dirPath,
  shouldReplaceFileContent,
  replaceTextWith,
  textToBeReplaced,
  fileName,
  shouldReplaceFileName,
  fileNameTextToBeReplaced,
  searchAndReplaceSeparator,
  searchAndReplace,
  configDir,
}: Options): Promise<void> => {
  const { filePath, fileNameUpdated } = createFilePathAndNameFromTemplate({
    templatePath,
    shouldReplaceFileName,
    fileNameTextToBeReplaced,
    dirPath,
    fileName,
  });

  Logger.debug("Reading file:", templatePath);

  const fileContent = await getFileContent({
    templatePath,
    textToBeReplaced,
    replaceTextWith,
    searchAndReplaceSeparator,
    shouldReplaceFileContent,
    fileName: fileNameUpdated,
    searchAndReplace,
    configDir,
  });

  await createFileAndWriteContent(filePath, fileContent);

  Logger.info(`${filePath} created!`);
};

const getFileContent = async ({
  templatePath,
  textToBeReplaced,
  replaceTextWith,
  searchAndReplaceSeparator,
  shouldReplaceFileContent,
  fileName,
  searchAndReplace,
  configDir,
}: Pick<
  Options,
  | CLIArg.TEMPLATE_PATH
  | CLIArg.TEXT_TO_BE_REPLACED
  | CLIArg.REPLACE_TEXT_WITH
  | CLIArg.SEARCH_AND_REPLACE_SEPARATOR
  | CLIArg.SHOULD_REPLACE_FILE_CONTENT
  | CLIArg.FILE_NAME
  | "searchAndReplace"
  | "configDir"
>): Promise<string> => {
  let fileContent = await readFileContent(templatePath);

  if (!shouldReplaceFileContent) return fileContent;

  const searchAndReplaceItems = createSearchAndReplaceItemsFromArgs({
    textToBeReplaced,
    replaceTextWith,
    searchAndReplaceSeparator,
    searchAndReplace,
  });

  fileContent = await replaceSearchItems({
    searchAndReplaceItems,
    fileName,
    configDir,
    fileContent,
  });

  fileContent = replaceEnvVariables(fileContent);

  fileContent = replaceDateTime(fileContent);

  return fileContent;
};

const createSearchAndReplaceItemsFromArgs = ({
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

const replaceSearchItems = async ({
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

const createFilePathAndNameFromTemplate = ({
  templatePath,
  shouldReplaceFileName,
  fileNameTextToBeReplaced,
  fileName,
  dirPath,
}: Pick<
  Options,
  | CLIArg.TEMPLATE_PATH
  | CLIArg.SHOULD_REPLACE_FILE_NAME
  | CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED
  | CLIArg.DIR_PATH
  | CLIArg.FILE_NAME
>): { filePath: string; fileNameUpdated: string } => {
  const templateFileName = path.basename(templatePath);

  const fileNameUpdated = shouldReplaceFileName
    ? templateFileName.replace(
        new RegExp(fileNameTextToBeReplaced, "g"),
        fileName
      )
    : templateFileName;

  return { filePath: path.join(dirPath, fileNameUpdated), fileNameUpdated };
};

const replaceEnvVariables = (text: string): string => {
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

const replaceDateTime = (text: string): string => {
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
