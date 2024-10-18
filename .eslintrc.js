// .eslintrc.js

const path = require("path"); // Ensure 'path' is imported

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // Integrates Prettier with ESLint
    "plugin:import/recommended", // Adds recommended import rules
    "plugin:import/typescript", // Adds TypeScript-specific import rules
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021, // Use full year notation for clarity
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "prettier",
    "import", // Add the import plugin
  ],
  rules: {
    // Prettier rules to enforce code formatting
    "prettier/prettier": [
      "error",
      {
        singleQuote: false, // Enforce double quotes
        semi: true, // Enforce semicolons
        trailingComma: "es5",
        printWidth: 80,
        tabWidth: 2,
        endOfLine: "auto",
      },
    ],
    // ESLint rules
    semi: ["error", "always"],
    quotes: ["error", "double"],
    "no-unused-vars": "off", // Disabled to let @typescript-eslint handle it
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/explicit-function-return-type": ["warn"], // Encourage explicit return types
    "@typescript-eslint/no-explicit-any": ["warn"], // Discourage usage of 'any' type
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"], // Prefer 'interface' over 'type'
    "no-console": ["warn", { allow: ["warn", "error"] }], // Allow console.warn and console.error
    "prefer-const": ["error"], // Enforce use of 'const' over 'let' where applicable
    "arrow-body-style": ["error", "as-needed"], // Simplify arrow functions
    "object-shorthand": ["error", "always"], // Use object shorthand where possible
    "prefer-arrow-callback": ["error"], // Use arrow functions for callbacks
    "no-var": ["error"], // Disallow 'var', encourage 'let' or 'const'
    "import/order": [
      "error",
      {
        groups: [
          ["builtin", "external", "internal"],
          ["sibling", "parent", "index"],
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/no-unresolved": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "never",
        tsx: "never",
        js: "never",
        jsx: "never",
      },
    ],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        paths: [path.resolve(__dirname, "src")], // Adjust based on your project structure
      },
    },
  },
  ignorePatterns: ["dist/", "node_modules/"], // Ignore build and dependency directories
};
