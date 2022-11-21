import fs from "fs";
import path from "path";
import { promisify } from "util";
import Logger from "../logger";

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

export const createFile = async ({
  templatePath,
  dirPath,
  shouldReplaceFileContent,
  replaceTextWith,
  textToBeReplaced,
  fileName,
  shouldReplaceFileName,
  fileNameTextToBeReplaced,
  searchAndReplaceSeparator,
}: {
  templatePath: string;
  dirPath: string;
  fileName: string;
  shouldReplaceFileName: boolean;
  fileNameTextToBeReplaced: string;
  shouldReplaceFileContent: boolean;
  replaceTextWith: string;
  textToBeReplaced: string;
  searchAndReplaceSeparator: string;
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
      `Replacing word ${currentToBeReplaced} with ${currentReplaceTextWith} in file ${fileNameUpdated}`
    );

    fileContent = shouldReplaceFileContent
      ? fileContent.replace(
          new RegExp(currentToBeReplaced, "g"),
          currentReplaceTextWith
        )
      : fileContent;
  });

  await createFileAndWriteContent(filePath, fileContent);

  Logger.debug(`${filePath} created!`);
};

const readFileContent = async (pathArg: string) => {
  try {
    return (await promisify(fs.readFile)(pathArg)).toString();
  } catch (e) {
    Logger.debug(e);
    throw new Error(`Couldn't read file content from path: '${pathArg}'`);
  }
};
