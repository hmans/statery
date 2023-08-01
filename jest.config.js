module.exports = {
  verbose: true,
  preset: "ts-jest",
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx)"],
  testPathIgnorePatterns: ["node_modules"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts", "tsx"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
        babel: true,
        tsconfig: "tsconfig.json"
      }
    ]
  }
}
