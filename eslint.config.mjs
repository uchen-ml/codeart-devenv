import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["src/**/*.ts", "test/**/*.ts"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        ignores: [
            "node_modules/**",
            "build/**",
            "types/**",
            ".prettierrc.cjs",
            "babel.config.js",
            "eslint.config.mjs",
        ],
    },
    {
        rules: {
            "object-curly-spacing": ["error", "always"],
        },
    },
];
