/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/app/$1",
    "^~~/(.*)$": "<rootDir>/$1",
    "^#imports$": "<rootDir>/.nuxt/imports.d.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.test.json",
        diagnostics: false,
      },
    ],
  },
};
