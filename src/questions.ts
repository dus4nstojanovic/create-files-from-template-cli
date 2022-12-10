import inquirer, { Answers, Question } from "inquirer";
import { isNonEmptyString } from "./validation";

/**
 * Asks the input (text) question
 * @param name The question name
 * @param message The question to be asked
 * @param answers The current answers
 * @param defaultValue The default value to be used if none is provided
 * @returns The updated answers
 */
export const askInputQuestion = (
  name: string,
  message: string,
  answers: Answers,
  defaultValue?: string
): Promise<Answers> =>
  askQuestion(
    {
      type: "input",
      name,
      message,
      validate: isNonEmptyString,
      default: defaultValue,
    },
    answers
  );

/**
 * Asks the confirmation question (yes/no)
 * @param name The question name
 * @param message The question to be asked
 * @param answers The current answers
 * @returns The updated answers
 */
export const askConfirmQuestion = (
  name: string,
  message: string,
  answers: Answers
): Promise<Answers> =>
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
