import { Config } from "./../config.constants";
import { CLIArg } from "../../options";
import { getOrCreateConfig, getTemplateFromConfig } from "../config.main";
import * as ConfigUtils from "../config.utils";
import * as FileUtils from "../../files/files.utils";

const TEMPLATE_CONFIG = {
  name: "component",
  options: {
    [CLIArg.TEMPLATE_PATH]: "/.cfft.templates/component",
    [CLIArg.DIR_PATH]: "./{fileName}",
    [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: "component",
    [CLIArg.TEXT_TO_BE_REPLACED]: "FileName",
    [CLIArg.REPLACE_TEXT_WITH]: "{fileName}",
    [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: true,
    [CLIArg.SHOULD_REPLACE_FILE_NAME]: true,
    [CLIArg.SEARCH_AND_REPLACE_SEPARATOR]: ";",
  },
};
const CONFIG: Config = {
  defaultTemplateName: "component",
  templates: [TEMPLATE_CONFIG],
  folder: "/Users/username",
  path: "/Users/username/cfft.config.json",
};

describe("getOrCreateConfig", () => {
  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest
      .spyOn(ConfigUtils, "findConfig")
      .mockImplementation(() => Promise.resolve(CONFIG));
  });

  it("should retrieve a config file if it can be found", async () => {
    const result = await getOrCreateConfig();

    expect(result).not.toBeNull();
    expect(result.created).toBeFalsy();
    expect(result.config).toEqual(CONFIG);
  });
  it("should create a config file and write content to it if it can not be found", async () => {
    jest
      .spyOn(ConfigUtils, "findConfig")
      .mockImplementation(() => Promise.resolve(null) as any);

    jest
      .spyOn(FileUtils, "createFileAndWriteContent")
      .mockImplementation(jest.fn());

    const result = await getOrCreateConfig();

    expect(result).not.toBeNull();
    expect(result.created).toBeTruthy();
    expect(ConfigUtils.findConfig).toHaveBeenCalled();
  });

  it("should throw an error if there is an issue creating a file", async () => {
    jest
      .spyOn(ConfigUtils, "findConfig")
      .mockImplementation(() => Promise.resolve(null) as any);

    jest
      .spyOn(FileUtils, "createFileAndWriteContent")
      .mockImplementation(() => {
        throw new Error(`Error creating or writing a file`);
      });

    expect.assertions(1);
    try {
      await getOrCreateConfig();
    } catch (e: any) {
      expect(e.message).toBe("Error creating or writing a file");
    }
  });
});

describe("getTemplateFromConfig", () => {
  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should retrieve a template from config correctly", () => {
    const result = getTemplateFromConfig(CONFIG, "component");

    expect(result).toEqual(TEMPLATE_CONFIG);
  });

  it(`should throw an error if a template can't be found`, () => {
    expect.assertions(1);
    try {
      getTemplateFromConfig(CONFIG, "unknown");
    } catch (e: any) {
      expect(e.message).toBe(`Couldn't find template unknown`);
    }
  });
});
