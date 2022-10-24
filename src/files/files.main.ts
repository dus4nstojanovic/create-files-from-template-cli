import { Options } from "../options";
import fs from "fs";
import { promisify } from "util";
import Logger from "../logger";
import { createFile, createPath, getFilesPaths } from ".";

export const createFiles = async (options: Options) => {
  const templatePath = createPath(options.templatePath);
  const dirPath = createPath(options.dirPath);
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
