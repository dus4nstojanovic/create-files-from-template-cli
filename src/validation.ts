export const isNonEmptyString = (input: string): boolean =>
  typeof input === "string" && !!input?.length;

export const isBoolean = (input: any): boolean => [true, false].includes(input);
