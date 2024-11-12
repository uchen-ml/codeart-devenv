import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";

type SpawnResult = {
    code: number;
    error: string | undefined;
    output: string | undefined;
};

export function spawnProcess([executable, ...args]: string[]) {
    return new Promise<SpawnResult>((resolve) => {
        const child = spawn(executable, args);
        let output: Buffer | null = null;
        let error: Buffer | null = null;
        child.stdout.on("data", (data) => {
            if (output === null) {
                output = data;
            } else {
                output = Buffer.concat([output, data]);
            }
        });
        child.stderr.on("data", (data) => {
            if (error === null) {
                error = data;
            } else {
                error = Buffer.concat([error, data]);
            }
        });
        child.on("close", (code) =>
            resolve({
                code: code ?? 0,
                output: output?.toString().trim(),
                error: error?.toString().trim(),
            }),
        );
    });
}

export async function realPath(executable: string) {
    const { code, output } = await spawnProcess(["which", executable]);
    if (code !== 0 || !output) {
        return null;
    }
    return await fs.realpath(output);
}
