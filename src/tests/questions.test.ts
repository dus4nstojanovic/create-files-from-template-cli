import { askConfirmQuestion } from "./../questions";
import { askInputQuestion } from "../questions";

const VALUE = "value";

test("should askInputQuestion retrieve the answer correctly", async () => {
  const name = "name";
  const result = await askInputQuestion(name, "My message", {}, "default");

  expect(result).toEqual({ [name]: VALUE });
});

test("should askInputQuestion retrieve the answer correctly when some answers already exist", async () => {
  const name = "name";
  const result = await askInputQuestion(
    name,
    "My message",
    { existingAnswer: "answer" },
    "default"
  );

  expect(result).toEqual({ existingAnswer: "answer", [name]: VALUE });
});

test("should askInputQuestion retrieve the answer correctly", async () => {
  const name = "name";
  const result = await askConfirmQuestion(name, "My message", {});

  expect(result).toEqual({ [name]: VALUE });
});

test("should askInputQuestion retrieve the answer correctly when some answers already exist", async () => {
  const name = "name";
  const result = await askConfirmQuestion(name, "My message", {
    existingAnswer: "answer",
  });

  expect(result).toEqual({ existingAnswer: "answer", [name]: VALUE });
});
