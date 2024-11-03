import yargs from "yargs";

import { hideBin } from "yargs/helpers";
import { listCompilers } from "./discovery/compilers";

// Init yargs and introduce the command ls
yargs(hideBin(process.argv))
    .command(
        "ls",
        "List all compilers",
        () => {},
        async () => {
            console.log(await listCompilers());
        },
    )
    .parse();
