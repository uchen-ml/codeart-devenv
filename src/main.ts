import yargs from "yargs";

import { hideBin } from "yargs/helpers";
import Compilers from "./discovery/compilers";

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
    .parse();
