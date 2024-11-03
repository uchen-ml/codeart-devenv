import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";

enum CompilerFamily {
    Unknown = "UNKNOWN",
    GCC = "GCC",
    Clang = "Clang",
}

const CompilerDefaults = [
    { executable: "c++", family: CompilerFamily.Unknown },
    { executable: "gcc", family: CompilerFamily.GCC },
    { executable: "clang", family: CompilerFamily.Clang },
    { executable: "g++", family: CompilerFamily.GCC },
    { executable: "clang++", family: CompilerFamily.Clang },
];

type CompilerDefaultType = (typeof CompilerDefaults)[number];

const CompileVersionArgs = {
    [CompilerFamily.GCC]: ["--version"],
    [CompilerFamily.Clang]: ["--version"],
    [CompilerFamily.Unknown]: ["--version"],
};

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
        const resolved = await Promise.all(
            CompilerDefaults.map(this.checkCompiler),
        );
        return resolved.filter((compiler) => compiler !== null);
    };

    private checkCompiler = async ({
        executable,
        family,
    }: CompilerDefaultType) => {
        const { code, output } = await spawn_process(["which", executable]);
        if (code !== 0) {
            return null;
        }
        const realpath = await fs.realpath(output);
        if (!this.versionCache.has(realpath)) {
            this.versionCache.set(realpath, this.getVersion(realpath, family));
        }
        try {
            const version = await this.versionCache.get(realpath);
            return { command: executable, path: realpath, version };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return null;
        }
    };

    private getVersion = async (executable: string, family: CompilerFamily) => {
        const { code: versionCode, output: version } = await spawn_process([
            executable,
            ...CompileVersionArgs[family],
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
