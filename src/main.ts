import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs/promises";
import path from "path";

import Compilers from "./discovery/compilers";
import CompilationDatabases from "./discovery/compilation_databases";
import Defines from "./discovery/defines";

async function getCompilerDefines(compiler: string) {
    const c = await new Compilers().discover(compiler);
    if (c === null) {
        console.error(`Compiler ${compiler} not found`);
        process.exit(1);
    }
    return await new Defines().getCompilerDefines(
        c.command,
        c.family,
        c.language,
    );
}

// Init yargs and introduce the command ls
yargs(hideBin(process.argv))
    .command(
        "ls",
        "List all compilers",
        () => {},
        async () => {
            const compilers = new Compilers();
            console.log(await compilers.list());
        },
    )
    .command(
        "defines <compiler>",
        "List all defines",
        (yarg) =>
            yarg.positional("compiler", {
                type: "string",
                default: "c++",
            }),
        async ({ compiler }) => console.log(await getCompilerDefines(compiler)),
    )
    .command(
        "db <path>",
        "Parse compilation database JSON file",
        (yarg) =>
            yarg.positional("path", {
                type: "string",
                required: true,
                description: "Path to the compilation database JSON file",
            }),
        async ({ path }) => {
            if (!path) {
                console.error("Path is required");
                process.exit(1);
            }
            console.log((await new CompilationDatabases().read(path)).stats());
        },
    )
    .command(
        "info <file>",
        "Get information about a file",
        (yarg) =>
            yarg
                .positional("file", {
                    type: "string",
                    required: true,
                    description: "Path to the file",
                })
                .option("db", {
                    type: "string",
                    description: "Path to the compilation database JSON file",
                }),
        async ({ db, file }) => {
            if (!file) {
                console.error("File is required");
                process.exit(1);
            }
            try {
                await fs.stat(file);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                console.error(`File ${file} not found`);
                process.exit(1);
            }
        },
    )
    .parse();
