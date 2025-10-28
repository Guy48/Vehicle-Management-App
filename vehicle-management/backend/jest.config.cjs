// backend/jest.config.cjs
// CommonJS file so Node/Jest can require it even with "type":"module" in package.json.
module.exports = {
  // Use ts-jest ESM preset so TypeScript + ESM works together
  preset: "ts-jest/presets/default-esm",

  testEnvironment: "node",

  // Treat TypeScript files as ESM so `import.meta` is allowed
  extensionsToTreatAsEsm: [".ts"],

  // Transform TS files with ts-jest (useESM true to compile to ESM)
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }]
  },

  // ts-jest ESM config (keeps diagnostics sensible)
  globals: {
    "ts-jest": {
      // useESM already set in transform; tsconfig override ensures proper module target
      tsconfig: {
        module: "ES2020",
        target: "ES2020",
        moduleResolution: "node"
      },
      // avoid noisy type errors from node libs during test runs
      diagnostics: false
    }
  },

  testMatch: ["**/src/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"]
};
