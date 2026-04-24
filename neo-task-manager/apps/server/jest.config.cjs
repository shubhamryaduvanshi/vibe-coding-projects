module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@neo/types$": "<rootDir>/../../packages/types/src/index.ts",
    "^@neo/utils$": "<rootDir>/../../packages/utils/src/index.ts"
  },
  extensionsToTreatAsEsm: [".ts"]
};
