import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";

const compilers = ["c++", "gcc", "clang", "g++", "clang++"];

function spawn_process([executable, ...args]: string[]) {
    return new Promise<{ code: number; output: string }>((resolve) => {
        const child = spawn(executable, args);
        let output: Buffer | null = null;
        child.stdout.on("data", (data) => {
            if (output === null) {
                output = data;
            } else {
                output = Buffer.concat([output, data]);
            }
        });
        child.on("close", (code) =>
            resolve({ code, output: output.toString().trim() }),
        );
    });
}

async function checkCompiler(compiler: string) {
    const { code, output } = await spawn_process(["which", compiler]);
    if (code !== 0) {
        return null;
    }
    const realpath = await fs.realpath(output);
    const { code: versionCode, output: version } = await spawn_process([
        realpath,
        "--version",
    ]);
    if (versionCode !== 0) {
        return null;
    }
    return { command: compiler, path: realpath, version };
}

export async function listCompilers() {
    return await Promise.all(compilers.map(checkCompiler));
}
