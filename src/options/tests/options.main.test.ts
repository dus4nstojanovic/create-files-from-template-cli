import {
  Config,
  SearchAndReplaceItem,
} from "@beezydev/create-files-from-template-base/config";
import { getOptions, isDebug } from "../options.main";
import { CLIArg } from "../options.constants";

const SEARCH_AND_REPLACE: SearchAndReplaceItem[] = [
  { search: "FileName", replace: "{fileName}", ignoreCase: true },
  { search: "FunctionComponent", replace: "FC" },
  {
    search: "dusan.*outlook\\.com",
    replace: "dus4nstojanovic@gmail.com",
  },
];

const CONFIG: Config = {
  path: "/path",
  folder: "path",
  defaultTemplateName: "component",
  templates: [
    {
      name: "templateNameArgValue",
      options: {
        [CLIArg.TEMPLATE_PATH]: "/.cfft.templates/component",
        [CLIArg.DIR_PATH]: "./{fileName}",
        [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: "component",
        [CLIArg.TEXT_TO_BE_REPLACED]: "FileName",
        [CLIArg.REPLACE_TEXT_WITH]: "{fileName}",
        [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: true,
        [CLIArg.SHOULD_REPLACE_FILE_NAME]: true,
        [CLIArg.SEARCH_AND_REPLACE_SEPARATOR]: ";",
        searchAndReplace: SEARCH_AND_REPLACE,
      },
    },
  ],
};

describe("isDebug", () => {
  it("should be truthy when isDebug argument is provided", () => {
    expect(isDebug()).toBeTruthy();
  });
});

describe("getOptions", () => {
  it("should retrieve correct options", async () => {
    const options = await getOptions({ ...CONFIG });

    expect(options).toEqual({
      [CLIArg.TEMPLATE_NAME]: "templateNameArgValue",
      [CLIArg.FILE_NAME]: "value",
      [CLIArg.DIR_PATH]: "./value",
      [CLIArg.TEMPLATE_PATH]: "path/.cfft.templates/component",
      [CLIArg.SHOULD_REPLACE_FILE_NAME]: true,
      [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]:
        "fileNameTextToBeReplacedArgValue",
      [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: true,
      [CLIArg.TEXT_TO_BE_REPLACED]: "FileName",
      [CLIArg.REPLACE_TEXT_WITH]: "value",
      [CLIArg.SEARCH_AND_REPLACE_SEPARATOR]: ";",
      searchAndReplace: [
        { search: "FileName", replace: "value", ignoreCase: true },
        { search: "FunctionComponent", replace: "FC" },
        {
          search: "dusan.*outlook\\.com",
          replace: "dus4nstojanovic@gmail.com",
        },
      ],
      configDir: "path",
    });
  });
});
