import { confirm, input } from "@inquirer/prompts";
import { isNonEmptyString } from "./validation";
import { Answers } from "./types";

/**
 * Asks the input (text) question
 * @param name The question name
 * @param message The question to be asked
 * @param answers The current answers
 * @param defaultValue The default value to be used if none is provided
 * @returns The updated answers
 */
export const askInputQuestion = async (
  name: string,
  message: string,
  answers: Partial<Answers>,
  defaultValue?: string
): Promise<Partial<Answers>> => {
  const answer = await input({
    message,
    validate: isNonEmptyString,
    default: defaultValue,
  });

  answers = { ...answers, [name]: answer };

  return answers;
};

/**
 * Asks the confirmation question (yes/no)
 * @param name The question name
 * @param message The question to be asked
 * @param answers The current answers
 * @returns The updated answers
 */
export const askConfirmQuestion = async (
  name: string,
  message: string,
  answers: Partial<Answers>
): Promise<Partial<Answers>> => {
  const answer = await confirm({
    message,
  });

  answers = { ...answers, [name]: answer };

  return answers;
};
