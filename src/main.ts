import yargs from "yargs";

import { hideBin } from "yargs/helpers";
import Compilers from "./discovery/compilers";
import Defines from "./discovery/defines";

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
        async ({ compiler }) => {
            const c = await new Compilers().discover(compiler);
            if (c === null) {
                console.error(`Compiler ${compiler} not found`);
                process.exit(1);
            }
            console.log(
                await new Defines().getCompilerDefines(
                    c.command,
                    c.family,
                    c.language,
                ),
            );
        },
    )
    .parse();
