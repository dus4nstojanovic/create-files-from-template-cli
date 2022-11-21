import { isDirectory } from "./files.utils";
import { Options } from "../options";
import Logger from "../logger";
import {
  createDirectory,
  createFileOrDirectoryFromTemplate,
  createPath,
  getInnerDirectoriesAndFilesPaths,
} from ".";

/**
 * Creates all directories and files using the provided options
 * @param options The options for the files and folders creation
 */
export const createAllDirectoriesAndFilesFromTemplate = async (
  options: Options
) => {
  const templatePath = createPath(options.templatePath);

  Logger.debug("Template path:", templatePath);

  if (!isDirectory(templatePath)) {
    throw new Error("templatePath must be a directory!");
  }

  const dirPath = createPath(options.dirPath);
  const fileName = options.fileName;

  Logger.debug("Desctination directory path:", dirPath);

  await createDirectory(dirPath);

  Logger.debug("Destination directory created or has already existed!");

  const templateFilesPaths = await getInnerDirectoriesAndFilesPaths(
    templatePath
  );

  Logger.debug("Templates paths:", templateFilesPaths);

  await Promise.all(
    templateFilesPaths.map((templateFilePath) =>
      createFileOrDirectoryFromTemplate({
        ...options,
        templatePath: templateFilePath,
        dirPath,
        fileName,
      })
    )
  );
};
