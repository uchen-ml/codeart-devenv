/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {
    rootDir: ".",
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "test/.*\\.test\\.ts$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
};

export default config;
