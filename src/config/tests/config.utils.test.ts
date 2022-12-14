import { findConfig } from "../config.utils";
import fs from "fs";

const FILE = `
{
    "defaultTemplateName": "component",
    "templates": [
      {
        "name": "component",
        "options": {
          "templatePath": "/.cfft.templates/component",
          "dirPath": "./{fileName}",
          "fileNameTextToBeReplaced": "component",
          "textToBeReplaced": "FileName",
          "replaceTextWith": "{fileName}",
          "shouldReplaceFileContent": true,
          "shouldReplaceFileName": true
        }
      }
    ]
  }
`;

describe("findConfig", () => {
  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(process, "cwd").mockImplementation(() => "/Users/username");
    jest.spyOn(fs, "readFile").mockImplementation((path, callback: any) => {
      callback(null, FILE);
    });
  });

  it("should find the config correctly", async () => {
    const result = await findConfig();

    expect(result).toEqual({
      ...JSON.parse(FILE),
      folder: "/Users/username",
      path: "/Users/username/cfft.config.json",
    });
  });

  it("should try with the parent folder if the file can not be found", async () => {
    jest.spyOn(fs, "readFile").mockImplementation((path, callback: any) => {
      if (path === "/Users/cfft.config.json") {
        callback(null, FILE);
      } else {
        callback(new Error("File not found"));
      }
    });

    const result = await findConfig();

    expect(result).toEqual({
      ...JSON.parse(FILE),
      folder: "/Users",
      path: "/Users/cfft.config.json",
    });
  });

  it("should stop searching for the file if there is no file", async () => {
    jest.spyOn(fs, "readFile").mockImplementation((path, callback: any) => {
      callback(new Error("File not found"));
    });

    const result = await findConfig();

    expect(result).toBeNull();
  });
});
