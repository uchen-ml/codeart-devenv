import { promises as fs } from "node:fs";

import { CompilerFamily, Language } from "./types.js";
import { spawn_process } from "./helpers.js";

const CompilerDefaults = [
    { executable: "cc", family: CompilerFamily.Unknown, language: Language.C },
    {
        executable: "c++",
        family: CompilerFamily.Unknown,
        language: Language.Cpp,
    },
    { executable: "gcc", family: CompilerFamily.GCC, language: Language.C },
    { executable: "clang", family: CompilerFamily.Clang, language: Language.C },
    { executable: "g++", family: CompilerFamily.GCC, language: Language.Cpp },
    {
        executable: "clang++",
        family: CompilerFamily.Clang,
        language: Language.Cpp,
    },
];

type CompilerDefaultType = (typeof CompilerDefaults)[number];

const CompileVersionArgs = {
    [CompilerFamily.GCC]: ["--version"],
    [CompilerFamily.Clang]: ["--version"],
    [CompilerFamily.Unknown]: ["--version"],
};

export function getCompilerFamilyFromVersion(version: string | null) {
    if (!version) {
        return null;
    }
    return version.split("\n")[0].toLowerCase().match(/clang/)
        ? CompilerFamily.Clang
        : CompilerFamily.GCC;
}

export default class Compilers {
    discover = async (
        compiler: string,
        family: CompilerFamily = CompilerFamily.Unknown,
        language: Language = Language.Cpp,
    ) => {
        return await this.checkCompiler({
            executable: compiler,
            family,
            language,
        });
    };

    list = async () => {
        const resolved = await Promise.all(
            CompilerDefaults.map(this.checkCompiler),
        );
        return resolved.filter((compiler) => compiler !== null);
    };

    private checkCompiler = async ({
        executable,
        family,
        language,
    }: CompilerDefaultType) => {
        const { code, output } = await spawn_process(["which", executable]);
        if (code !== 0 || !output) {
            return null;
        }
        const realpath = await fs.realpath(output);
        if (!this.versionCache.has(realpath)) {
            this.versionCache.set(realpath, this.getVersion(realpath, family));
        }
        try {
            const version = await this.versionCache.get(realpath)!;
            return {
                command: executable,
                path: realpath,
                version,
                family: getCompilerFamilyFromVersion(version) ?? family,
                language,
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return null;
        }
    };

    private getVersion = async (
        executable: string,
        family: CompilerFamily,
    ): Promise<string | null> => {
        const {
            code: versionCode,
            output: version,
            error,
        } = await spawn_process([executable, ...CompileVersionArgs[family]]);
        if (versionCode !== 0 || !version) {
            console.error(`Failed to get version for ${executable}: ${error}`);
            return null;
        }
        return version;
    };

    private versionCache = new Map<string, Promise<string | null>>();
}
