import { isNonEmptyString, isBoolean } from "../validation";

describe("isNonEmptyString", () => {
  it("should be truthy for the non empty string", () => {
    expect(isNonEmptyString("abc")).toBeTruthy();
  });

  it("should be falsy for an empty string", () => {
    expect(isNonEmptyString("")).toBeFalsy();
  });

  it("should be falsy for null", () => {
    expect(isNonEmptyString(null as any)).toBeFalsy();
  });

  it("should be falsy for undefined", () => {
    expect(isNonEmptyString(undefined as any)).toBeFalsy();
  });

  it("should be falsy for 0", () => {
    expect(isNonEmptyString(0 as any)).toBeFalsy();
  });

  it("should be truthy for '1'", () => {
    expect(isNonEmptyString("1" as any)).toBeTruthy();
  });

  it("should be truthy for true", () => {
    expect(isBoolean(true)).toBeTruthy();
  });
});

describe("isBoolean", () => {
  it("should be truthy for false", () => {
    expect(isBoolean(false)).toBeTruthy();
  });

  it("should be falsy for 'true'", () => {
    expect(isBoolean("true")).toBeFalsy();
  });

  it("should be falsy for 'false'", () => {
    expect(isBoolean("false")).toBeFalsy();
  });

  it("should be falsy for an empty object", () => {
    expect(isBoolean({})).toBeFalsy();
  });
});
