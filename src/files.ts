import { Options } from "./options";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import Logger from "./logger";

const createCWDPath = (pathArg: string) =>
  path.join(process.cwd(), ...pathArg.split("/"));

const getFilesPaths = async (dirPath: string) => {
  try {
    const files = await promisify(fs.readdir)(dirPath);
    return files.map((file) => `${dirPath}/${file}`);
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't get files paths from folder: '${dirPath}'`);
  }
};

const readFileContent = async (pathArg: string) => {
  try {
    return (await promisify(fs.readFile)(pathArg)).toString();
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't read file content from path: '${pathArg}'`);
  }
};

const createFileAndWriteContent = async (pathArg: string, content: string) => {
  try {
    await promisify(fs.writeFile)(pathArg, content);
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't create file: '${pathArg}'`);
  }
};

const createFile = async ({
  templatePath,
  dirPath,
  shouldReplaceFileContent,
  replaceTextWith,
  textToBeReplaced,
  fileName,
  shouldReplaceFileName,
  fileNameTextToBeReplaced,
}: {
  templatePath: string;
  dirPath: string;
  fileName: string;
  shouldReplaceFileName: boolean;
  fileNameTextToBeReplaced: string;
  shouldReplaceFileContent: boolean;
  replaceTextWith: string;
  textToBeReplaced: string;
}) => {
  const templateFileName = path.basename(templatePath);

  const fileNameUpdated = shouldReplaceFileName
    ? templateFileName.replace(
        new RegExp(fileNameTextToBeReplaced, "g"),
        fileName
      )
    : `${fileName}.${templateFileName}`;

  const filePath = path.join(dirPath, fileNameUpdated);

  Logger.debug("Reading file:", templatePath);

  let fileContent = await readFileContent(templatePath);

  Logger.debug(
    `Replacing word ${textToBeReplaced} with ${replaceTextWith} in file ${fileNameUpdated}`
  );
  fileContent = shouldReplaceFileContent
    ? fileContent.replace(new RegExp(textToBeReplaced, "g"), replaceTextWith)
    : fileContent;

  await createFileAndWriteContent(filePath, fileContent);

  Logger.debug(`${filePath} created!`);
};

export const createFiles = async (options: Options) => {
  const templatePath = createCWDPath(options.templatePath);
  const dirPath = createCWDPath(options.dirPath);
  const fileName = options.fileName;

  Logger.debug("Template path:", templatePath);
  Logger.debug("Desctination directory path:", dirPath);

  await promisify(fs.mkdir)(dirPath, { recursive: true });
  Logger.debug("Destination directory created or has already existed"!);

  const templateFilesPaths = await getFilesPaths(templatePath);

  Logger.debug("Templates paths:", templateFilesPaths);

  await Promise.all(
    templateFilesPaths.map((templateFilePath) =>
      createFile({
        templatePath: templateFilePath,
        dirPath,
        fileName,
        shouldReplaceFileContent: options.shouldReplaceFileContent,
        shouldReplaceFileName: options.shouldReplaceFileName,
        replaceTextWith: options.replaceTextWith,
        textToBeReplaced: options.textToBeReplaced,
        fileNameTextToBeReplaced: options.fileNameTextToBeReplaced,
      })
    )
  );
};
