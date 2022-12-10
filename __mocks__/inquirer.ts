module.exports = {
  prompt: (
    questions: Array<{
      type: string;
      name: string;
      message: string;
      validate: (value: string) => boolean;
      default: string;
    }>
  ) =>
    questions.reduce(
      (acc, curr) => ({ ...acc, [curr.name]: "value" }),
      {} as Record<string, string>
    ),
};
