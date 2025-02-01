import { askConfirmQuestion, askInputQuestion } from "../questions";
import { input, confirm } from "@inquirer/prompts";

const VALUE = "value";

jest.mock("@inquirer/prompts", () => ({
  input: jest.fn(),
  confirm: jest.fn(),
}));

describe("askInputQuestion", () => {
  it("should retrieve the answer correctly", async () => {
    (input as jest.Mock).mockResolvedValue(VALUE);

    const name = "name";
    const result = await askInputQuestion(name, "My message", {}, "default");

    expect(result).toEqual({ [name]: VALUE });
  });

  it("should retrieve the answer correctly when some answers already exist", async () => {
    (input as jest.Mock).mockResolvedValue(VALUE);
    const name = "name";
    const result = await askInputQuestion(
      name,
      "My message",
      { existingAnswer: "answer" },
      "default"
    );

    expect(result).toEqual({ existingAnswer: "answer", [name]: VALUE });
  });

  it("should retrieve the answer correctly", async () => {
    (confirm as jest.Mock).mockResolvedValue(VALUE);
    const name = "name";
    const result = await askConfirmQuestion(name, "My message", {});

    expect(result).toEqual({ [name]: VALUE });
  });

  it("should retrieve the answer correctly when some answers already exist", async () => {
    (confirm as jest.Mock).mockResolvedValue(VALUE);
    const name = "name";
    const result = await askConfirmQuestion(name, "My message", {
      existingAnswer: "answer",
    });

    expect(result).toEqual({ existingAnswer: "answer", [name]: VALUE });
  });
});
