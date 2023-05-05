import Table from "cli-table";
import { CLIArg, CLIArgAlias } from "./options";

export const writeHelpTable = () => {
  const table = new Table({
    head: ["Command", "Alias", "Description"],
    style: {
      head: new Array(3).fill("cyan"),
    },
  });

  let rows = [
    [CLIArg.FILE_NAME, CLIArgAlias.FILE_NAME, "File name to be used"],
    [CLIArg.DIR_PATH, "", "Path to the location where to generate files"],
    [
      CLIArg.TEMPLATE_NAME,
      CLIArgAlias.TEMPLATE_NAME,
      "Name of the template to use",
    ],
    [CLIArg.TEMPLATE_PATH, "", "Path to the specific template folder"],
    [
      CLIArg.SHOULD_REPLACE_FILE_NAME,
      "",
      "Should or not CLI replace a file name",
    ],
    [
      CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED,
      "",
      "Wich part of the file name should be replaced",
    ],
    [
      CLIArg.SHOULD_REPLACE_FILE_CONTENT,
      "",
      "Should or not CLI replace a file content",
    ],
    [
      CLIArg.TEXT_TO_BE_REPLACED,
      "",
      "Text to be replaced separated by a search and replace separator",
    ],
    [
      CLIArg.REPLACE_TEXT_WITH,
      "",
      "Text to be used for search and replace separated by a separator",
    ],
    [
      CLIArg.SEARCH_AND_REPLACE_SEPARATOR,
      "",
      "Custom separator for search and replace",
    ],
    [
      "searchAndReplace",
      "",
      "Add additional search and replace items throug config (with extended options)",
    ],
    [
      CLIArg.VERSION,
      CLIArgAlias.VERSION,
      "Show the current version of the package",
    ],
    [CLIArg.DEBUG, "", "Show additional logs"],
  ];

  rows = rows.map(([command, alias, ...rest]) => [
    `--${command}`,
    !!alias ? `-${alias}` : "",
    ...rest,
  ]);

  table.push(...rows);

  console.log(table.toString());
};
