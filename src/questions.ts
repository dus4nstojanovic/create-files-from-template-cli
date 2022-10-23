import inquirer, { Answers, Question } from "inquirer";
import { isNotEmptyString } from "./validation";

export const askInputQuestion = (
  name: string,
  message: string,
  answers: Answers,
  defaultValue?: string
) =>
  askQuestion(
    {
      type: "input",
      name,
      message,
      validate: isNotEmptyString,
      default: defaultValue,
    },
    answers
  );

export const askConfirmQuestion = (
  name: string,
  message: string,
  answers: Answers
) =>
  askQuestion(
    {
      type: "confirm",
      name,
      message,
    },
    answers
  );

const askQuestion = async (
  question: Question,
  answers: Answers
): Promise<Answers> => {
  const answer = await inquirer.prompt([question]);
  answers = { ...answers, ...answer };
  return answers;
};
