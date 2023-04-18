import { CLIArg, Options } from "./../../options/options.constants";
import {
  createDirectory,
  createFileAndWriteContent,
  createFileOrDirectoryFromTemplate,
  createPath,
  getInnerDirectoriesAndFilesPaths,
  isDirectory,
  readFileContent,
} from "../files.utils";
import path from "path";
import fs from "fs";

describe("createPath", () => {
  it("should return the path as-is if it starts with a forward slash", () => {
    const pathArg = "/Users/username/my-project";

    expect(createPath(pathArg)).toBe(pathArg);
  });

  it("should prefix the current working directory to the path if it does not start with a forward slash", () => {
    const pathArg = "my-project";
    const cwd = "/Users/username";

    jest.spyOn(process, "cwd").mockImplementation(() => cwd);

    expect(createPath(pathArg)).toBe(path.join(cwd, pathArg));
  });
});

describe("getInnerDirectoriesAndFilesPaths", () => {
  const dirPath = "./test-dir";
  const files = ["file1.txt", "file2.txt", "file3.txt"];

  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(fs, "readdir").mockImplementation((path, callback: any) => {
      callback(null, files);
    });
  });

  it("should return an array of file paths", async () => {
    const expected = files.map((file) => `${dirPath}/${file}`);
    const result = await getInnerDirectoriesAndFilesPaths(dirPath);
    expect(result).toEqual(expected);
  });
  it("should throw an error if the directory cannot be read", async () => {
    jest.spyOn(fs, "readdir").mockImplementation((path, callback: any) => {
      callback(new Error("Directory not found"));
    });
    expect.assertions(1);
    try {
      await getInnerDirectoriesAndFilesPaths(dirPath);
    } catch (e: any) {
      expect(e.message).toBe(
        `Couldn't get files paths from folder: '${dirPath}'`
      );
    }
  });
});

describe("createFileAndWriteContent", () => {
  const pathArg = "./test-file.txt";
  const content = "This is a test file.";

  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(fs, "writeFile").mockImplementation((path, data, callback) => {
      callback(null);
    });
  });

  it("should create a file with the specified content", async () => {
    jest.spyOn(fs, "writeFile").mockImplementation((path, data, callback) => {
      callback(null);
    });

    await createFileAndWriteContent(pathArg, content);
    expect(fs.writeFile).toHaveBeenCalledWith(
      pathArg,
      content,
      expect.anything()
    );
  });

  it("should throw an error if the file cannot be created", async () => {
    jest.spyOn(fs, "writeFile").mockImplementation((path, data, callback) => {
      callback(new Error("File not found"));
    });
    expect.assertions(1);
    try {
      await createFileAndWriteContent(pathArg, content);
    } catch (e: any) {
      expect(e.message).toBe(`Couldn't create file: '${pathArg}'`);
    }
  });
});

describe("readFileContent", () => {
  const pathArg = "./test-file.txt";
  const content = "This is a test file.";

  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(fs, "readFile").mockImplementation((path, callback: any) => {
      callback(null, content);
    });
  });

  it("should read the content of the specified file", async () => {
    const result = await readFileContent(pathArg);
    expect(result).toBe(content);
  });

  it("should throw an error if the file cannot be read", async () => {
    jest.spyOn(fs, "readFile").mockImplementation((path, callback: any) => {
      callback(new Error("File not found"));
    });
    expect.assertions(1);
    try {
      await readFileContent(pathArg);
    } catch (e: any) {
      expect(e.message).toBe(
        `Couldn't read file content from path: '${pathArg}'`
      );
    }
  });
});

describe("createDirectory", () => {
  const path = "./test-dir";

  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(fs, "mkdir").mockImplementation(((
      path: any,
      {},
      callback: any
    ) => {
      callback(null);
    }) as any);
  });

  it("should create a directory with the specified path", async () => {
    const result = await createDirectory(path);
    expect(fs.mkdir).toHaveBeenCalledWith(
      path,
      { recursive: true },
      expect.anything()
    );
    expect(result).toBeUndefined();
  });

  it("should throw an error if the directory cannot be created", async () => {
    jest.spyOn(fs, "mkdir").mockImplementation(((
      path: any,
      {},
      callback: any
    ) => {
      callback(new Error("Directory not found"));
    }) as any);
    expect.assertions(1);
    try {
      await createDirectory(path);
    } catch (e: any) {
      expect(e.message).toBe(`Couldn't create directory for path: '${path}'`);
    }
  });
});

describe("isDirectory", () => {
  const path = "./test-dir";

  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(fs, "lstatSync").mockImplementation(
      (path) =>
        ({
          isDirectory: jest.fn(() => true),
        } as any)
    );
  });

  it("should return true if the specified path is a directory", () => {
    const result = isDirectory(path);
    expect(fs.lstatSync).toHaveBeenCalledWith(path);
    expect(result).toBe(true);
  });

  it("should throw an error if the path cannot be checked", () => {
    jest.spyOn(fs, "lstatSync").mockImplementation((path) => {
      throw new Error("Path not found");
    });
    expect.assertions(1);
    try {
      isDirectory(path);
    } catch (e: any) {
      expect(e.message).toBe(
        `Couldn't determine if the provided path is a directory: '${path}'`
      );
    }
  });
});

describe("createFileOrDirectoryFromTemplate", () => {
  const args: Options = {
    [CLIArg.TEMPLATE_NAME]: "component",
    [CLIArg.FILE_NAME]: "test-file",
    [CLIArg.DIR_PATH]: "./test-dir",
    [CLIArg.TEMPLATE_PATH]: "./template-dir",
    [CLIArg.SHOULD_REPLACE_FILE_CONTENT]: false,
    [CLIArg.SHOULD_REPLACE_FILE_NAME]: false,
    [CLIArg.FILE_NAME_TEXT_TO_BE_REPLACED]: "",
    [CLIArg.TEXT_TO_BE_REPLACED]: "",
    [CLIArg.REPLACE_TEXT_WITH]: "",
    [CLIArg.SEARCH_AND_REPLACE_SEPARATOR]: ",",
  };

  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    jest.spyOn(fs, "readdir").mockImplementation((path, callback: any) => {
      callback(null, ["file1.js", "file2.js"]);
    });

    jest.spyOn(fs, "lstatSync").mockImplementation(
      (path) =>
        ({
          isDirectory: jest.fn(() => !path.toString().includes(".js")),
        } as any)
    );

    jest.spyOn(fs, "mkdir").mockImplementation(((
      path: any,
      options: any,
      callback: any
    ) => {
      callback(null);
    }) as any);

    jest.spyOn(fs, "readFile").mockImplementation((path, callback: any) => {
      callback(null, "This is a test file.");
    });

    jest
      .spyOn(fs, "writeFile")
      .mockImplementation((path, content, callback) => {
        callback(null);
      });
  });

  it("should create a directory with children from the template if the template is a directory", async () => {
    await createFileOrDirectoryFromTemplate(args);

    expect(fs.readdir).toHaveBeenCalledWith(
      args.templatePath,
      expect.any(Function)
    );
    expect(fs.mkdir).toHaveBeenCalledWith(
      `test-dir/template-dir`,
      { recursive: true },
      expect.any(Function)
    );
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      1,
      "test-dir/template-dir/file1.js",
      "This is a test file.",
      expect.any(Function)
    );
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      2,
      "test-dir/template-dir/file2.js",
      "This is a test file.",
      expect.any(Function)
    );
  });

  it("should create a file from the template if the template is a file", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation(
      (path) =>
        ({
          isDirectory: jest.fn(() => false),
        } as any)
    );

    await createFileOrDirectoryFromTemplate(args);

    expect(fs.readFile).toHaveBeenCalledWith(
      args.templatePath,
      expect.anything()
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      `test-dir/template-dir`,
      "This is a test file.",
      expect.any(Function)
    );
  });

  it("should throw an error if the template cannot be accessed", async () => {
    jest.spyOn(fs, "lstatSync").mockImplementation((path) => {
      throw new Error("Path not found");
    });

    expect.assertions(1);
    try {
      await createFileOrDirectoryFromTemplate(args);
    } catch (e: any) {
      expect(e.message).toBe(
        `Couldn't determine if the provided path is a directory: '${args.templatePath}'`
      );
    }
  });
});
