import { Answers } from "inquirer";
import { CLIArg } from "../options.constants";
import { extractArg, getInputArg, hasArg, setArg } from "./../options.utils";

describe("setArg", () => {
  it("should set argument correctly", () => {
    expect(setArg(CLIArg.FILE_NAME, "fileName", {})).toEqual({
      [CLIArg.FILE_NAME]: "fileName",
    });
  });

  it("should set argument correctly when not empty", () => {
    expect(
      setArg(CLIArg.FILE_NAME, "fileName", {
        [CLIArg.SHOULD_REPLACE_FILE_NAME]: true,
      })
    ).toEqual({
      [CLIArg.SHOULD_REPLACE_FILE_NAME]: true,
      [CLIArg.FILE_NAME]: "fileName",
    });
  });
});

describe("getInputArg", () => {
  it("should retrieve correct value from console", async () => {
    let answers = {};
    answers = await getInputArg({
      arg: CLIArg.TEMPLATE_NAME,
      message: "Enter template name:",
      answers,
    });
    expect(answers).toEqual({ [CLIArg.TEMPLATE_NAME]: "templateNameArgValue" });
  });

  it("should retrieve correct value from the console when the config is also provided", async () => {
    let answers = {};
    answers = await getInputArg({
      arg: CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED,
      message: "Enter file name text to be replaced:",
      answers,
      templateConfig: {
        name: "component",
        options: {
          [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: "FileName",
        },
      },
    });
    expect(answers).toEqual({
      [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]:
        "fileNameTextToBeReplacedArgValue",
    });
  });

  it("should retrieve correct value from config", async () => {
    let answers = {};
    answers = await getInputArg({
      arg: CLIArg.TEXT_TO_BE_REPLACED,
      message: "Enter text to be replaced:",
      answers,
      templateConfig: {
        name: "component",
        options: {
          [CLIArg.TEXT_TO_BE_REPLACED]: "TextToBeReplaced",
        },
      },
    });
    expect(answers).toEqual({
      [CLIArg.TEXT_TO_BE_REPLACED]: "TextToBeReplaced",
    });
  });

  it("should replace the {fileName} placeholder correctly", async () => {
    let answers: Answers = {
      [CLIArg.FILE_NAME]: "MyFile",
    };

    answers = await getInputArg({
      arg: CLIArg.REPLACE_TEXT_WITH,
      message: "Replace text with:",
      answers,
      templateConfig: {
        name: "component",
        options: {
          [CLIArg.REPLACE_TEXT_WITH]: "{fileName}Test",
        },
      },
    });
    expect(answers).toEqual({
      [CLIArg.FILE_NAME]: "MyFile",
      [CLIArg.REPLACE_TEXT_WITH]: "MyFileTest",
    });
  });
});

describe("extractArg", () => {
  it("should retrieve the correct value", () => {
    expect(extractArg(CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED)).toBe(
      "fileNameTextToBeReplacedArgValue"
    );
  });

  it("should retrieve undefined for non-provided value", () => {
    expect(extractArg(CLIArg.FILE_NAME)).toBeUndefined();
  });
});

describe("hasArg", () => {
  it("should be truthy for provided value", () => {
    expect(hasArg(CLIArg.SHOULD_REPLACE_FILE_CONTENT)).toBeTruthy();
  });

  it("should be falsy when value is not provided", () => {
    expect(hasArg(CLIArg.FILE_NAME)).toBeFalsy();
  });
});
