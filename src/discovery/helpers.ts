import { spawn } from "node:child_process";

export function spawn_process([executable, ...args]: string[]) {
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
