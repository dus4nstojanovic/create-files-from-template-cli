import { isNonEmptyString, isBoolean } from "../validation";

test("Should isNonEmptyString be truthy for the non empty string", () => {
  expect(isNonEmptyString("abc")).toBeTruthy();
});

test("Should isNonEmptyString be falsy for an empty string", () => {
  expect(isNonEmptyString("")).toBeFalsy();
});

test("Should isNonEmptyString be falsy for null", () => {
  expect(isNonEmptyString(null as any)).toBeFalsy();
});

test("Should isNonEmptyString be falsy for undefined", () => {
  expect(isNonEmptyString(undefined as any)).toBeFalsy();
});

test("Should isNonEmptyString be falsy for 0", () => {
  expect(isNonEmptyString(0 as any)).toBeFalsy();
});

test("Should isNonEmptyString be truthy for '1'", () => {
  expect(isNonEmptyString("1" as any)).toBeTruthy();
});

test("Should isNonEmptyString be truthy for true", () => {
  expect(isBoolean(true)).toBeTruthy();
});

test("Should isBoolean be truthy for false", () => {
  expect(isBoolean(false)).toBeTruthy();
});

test("Should isBoolean be falsy for 'true'", () => {
  expect(isBoolean("true")).toBeFalsy();
});

test("Should isBoolean be falsy for 'false'", () => {
  expect(isBoolean("false")).toBeFalsy();
});

test("Should isBoolean be falsy for an empty object", () => {
  expect(isBoolean({})).toBeFalsy();
});
