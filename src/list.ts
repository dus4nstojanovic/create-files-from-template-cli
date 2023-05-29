import Table from "cli-table";
import { Config, findConfig } from "./config";
import Logger from "./logger";

export const listTemplates = async (isDetailed: boolean): Promise<void> => {
  const config = await findConfig();

  if (!config?.templates) return;

  isDetailed ? listTemplatesDetailed(config) : listTemplatesSimple(config);
};

export const listTemplatesSimple = (config: Config) => {
  Logger.log();
  config.templates.forEach((t) => {
    Logger.log(t.name);
  });
  Logger.log();
};

export const listTemplatesDetailed = (config: Config) => {
  const table = new Table({
    head: ["Name", "Description"],
    style: {
      head: new Array(3).fill("cyan"),
    },
  });

  let rows = config.templates.map((t) => [t.name, t.description || ""]);

  table.push(...rows);

  Logger.log(table.toString());
};
