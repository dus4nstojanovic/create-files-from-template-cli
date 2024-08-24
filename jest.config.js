/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transformIgnorePatterns: [
    "/node_modules/(?!@beezydev/create-files-from-template-base).+\\.js$",
  ],
};
