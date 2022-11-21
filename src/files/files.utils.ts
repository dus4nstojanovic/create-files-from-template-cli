import fs from "fs";
import path from "path";
import { promisify } from "util";
import Logger from "../logger";
import { CLIArg, Options } from "../options";

export const createPath = (pathArg: string) =>
  pathArg.startsWith("/")
    ? pathArg
    : path.join(process.cwd(), ...pathArg.split("/"));

export const getFilesPaths = async (dirPath: string) => {
  try {
    const files = await promisify(fs.readdir)(dirPath);
    return files.map((file) => `${dirPath}/${file}`);
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't get files paths from folder: '${dirPath}'`);
  }
};

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

export const readFileContent = async (pathArg: string): Promise<string> => {
  try {
    return (await promisify(fs.readFile)(pathArg)).toString();
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't read file content from path: '${pathArg}'`);
  }
};

export const createDirectory = (path: string): Promise<string | undefined> => {
  try {
    return promisify(fs.mkdir)(path, { recursive: true });
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't create directory for path: '${path}'`);
  }
};

export const isDirectory = (path: string): boolean => {
  try {
    return fs.lstatSync(path).isDirectory();
  } catch (e) {
    Logger.debug(e);
    throw new Error(
      `Couldn't check determine is the provided path a directory: '${path}'`
    );
  }
};

export const createFileOrDirectoryFromTemplate = async (args: Options) => {
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

  const templateFilesPaths = await getFilesPaths(templatePath);

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
}: Pick<
  Options,
  | CLIArg.TEMPLATE_PATH
  | CLIArg.TEXT_TO_BE_REPLACED
  | CLIArg.REPLACE_TEXT_WITH
  | CLIArg.SEARCH_AND_REPLACE_SEPARATOR
  | CLIArg.SHOULD_REPLACE_FILE_CONTENT
  | CLIArg.FILE_NAME
>): Promise<string> => {
  let fileContent = await readFileContent(templatePath);

  if (!shouldReplaceFileContent) return fileContent;

  const textToBeReplacedSplitted = textToBeReplaced.split(
    searchAndReplaceSeparator
  );
  const replaceTextWithSplitted = replaceTextWith.split(
    searchAndReplaceSeparator
  );

  if (textToBeReplacedSplitted.length !== replaceTextWithSplitted.length) {
    throw new Error(
      "textToBeReplaced and replaceTextWith arguments length mismatch!"
    );
  }

  textToBeReplacedSplitted.forEach((currentToBeReplaced, index) => {
    const currentReplaceTextWith = replaceTextWithSplitted[index];

    Logger.debug(
      `Replacing word ${currentToBeReplaced} with ${currentReplaceTextWith} in file ${fileName}`
    );

    fileContent = fileContent.replace(
      new RegExp(currentToBeReplaced, "g"),
      currentReplaceTextWith
    );
  });

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
    : `${fileName}.${templateFileName}`;

  return { filePath: path.join(dirPath, fileNameUpdated), fileNameUpdated };
};
