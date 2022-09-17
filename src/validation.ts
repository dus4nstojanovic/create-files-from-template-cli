export const isNotEmptyString = (input: string): boolean =>
  !!input && isNaN(input as any);

export const isBoolean = (input: any): boolean => [true, false].includes(input);
