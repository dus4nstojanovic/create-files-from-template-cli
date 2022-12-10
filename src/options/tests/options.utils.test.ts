import { CLIArg } from "../options.constants";
import { setArg } from "./../options.utils";

test("Should setArg set argument correctly", () => {
  expect(setArg(CLIArg.FILE_NAME, "fileName", {})).toEqual({
    [CLIArg.FILE_NAME]: "fileName",
  });
});

test("Should setArg set argument correctly when not empty", () => {
  expect(
    setArg(CLIArg.FILE_NAME, "fileName", { [CLIArg.DEBUG]: true })
  ).toEqual({
    [CLIArg.DEBUG]: true,
    [CLIArg.FILE_NAME]: "fileName",
  });
});
