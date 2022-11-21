import { Options } from "../options";
import Logger from "../logger";
import {
  createDirectory,
  createFileOrDirectoryFromTemplate,
  createPath,
  getFilesPaths,
} from ".";

export const createFiles = async (options: Options) => {
  const templatePath = createPath(options.templatePath);
  const dirPath = createPath(options.dirPath);
  const fileName = options.fileName;

  Logger.debug("Template path:", templatePath);
  Logger.debug("Desctination directory path:", dirPath);

  await createDirectory(dirPath);

  Logger.debug("Destination directory created or has already existed"!);

  const templateFilesPaths = await getFilesPaths(templatePath);

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
