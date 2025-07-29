// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Next.js plugin configuration
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      .../** @type {import('eslint').Linter.RulesRecord} */ (
        nextPlugin.configs.recommended.rules
      ),
      .../** @type {import('eslint').Linter.RulesRecord} */ (
        nextPlugin.configs["core-web-vitals"].rules
      ),
    },
  },
  {
    // Prettier and custom rules configuration
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off", // Disabled for production build
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-case-declarations": "warn",
      "prettier/prettier": ["warn", { endOfLine: "auto" }], // Changed to warn
      "@next/next/no-img-element": "warn", // Changed to warn
      "@next/next/no-html-link-for-pages": "error", // Keep as error
    },
  },
);
