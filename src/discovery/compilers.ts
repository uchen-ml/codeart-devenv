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

export default class Compilers {
    list = async () => {
        const resolved = await Promise.all(compilers.map(this.checkCompiler));
        return resolved.filter((compiler) => compiler !== null);
    };

    private checkCompiler = async (compiler: string) => {
        const { code, output } = await spawn_process(["which", compiler]);
        if (code !== 0) {
            return null;
        }
        const realpath = await fs.realpath(output);
        if (!this.versionCache.has(realpath)) {
            this.versionCache.set(realpath, this.getVersion(realpath));
        }
        try {
            const version = await this.versionCache.get(realpath);
            return { command: compiler, path: realpath, version };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return null;
        }
    };

    private getVersion = async (executable: string) => {
        const { code: versionCode, output: version } = await spawn_process([
            executable,
            "--version",
        ]);
        if (versionCode !== 0) {
            console.error(
                `Failed to get version for ${executable}: ${version}`,
            );
            return null;
        }
        return version;
    };

    private versionCache = new Map<string, Promise<string>>();
}
