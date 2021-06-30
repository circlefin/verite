module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "next",
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
        },
      },
    ],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", __dirname],
      },
    },
    react: {
      version: "detect",
    },
  },
};
