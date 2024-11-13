import { CompilerFamily, Language } from "./types";
import { realPath, spawnProcess } from "./helpers";

const CompilerDefaults = [
    { executable: "cc", language: Language.C },
    { executable: "c++", language: Language.Cpp },
    { executable: "gcc", language: Language.C },
    { executable: "clang", language: Language.C },
    { executable: "g++", language: Language.Cpp },
    { executable: "clang++", language: Language.Cpp },
];

type CompilerDefaultType = (typeof CompilerDefaults)[number];

export function getCompilerFamilyFromVersion(version: string | null) {
    if (!version) {
        return null;
    }
    return version.split("\n")[0].toLowerCase().match(/clang/)
        ? CompilerFamily.Clang
        : CompilerFamily.GCC;
}

export default class Compilers {
    constructor(
        private readonly spawner = spawnProcess,
        private readonly path_resolver = realPath,
    ) {}

    discover = async (compiler: string, language: Language = Language.Cpp) => {
        return await this.checkCompiler({
            executable: compiler,
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
        language,
    }: CompilerDefaultType) => {
        const realpath = await this.path_resolver(executable);
        if (!realpath) {
            throw new Error(`Could not find ${executable}`);
        }
        if (!this.versionCache.has(realpath)) {
            this.versionCache.set(realpath, this.getVersion(realpath));
        }
        try {
            const version = await this.versionCache.get(realpath)!;
            console.log(1, version);
            return {
                command: executable,
                path: realpath,
                version,
                family:
                    getCompilerFamilyFromVersion(version) ??
                    CompilerFamily.Unknown,
                language,
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return null;
        }
    };

    private getVersion = async (executable: string): Promise<string | null> => {
        const {
            code: versionCode,
            output: version,
            error,
        } = await this.spawner([executable, "--version"]);
        if (versionCode !== 0 || !version) {
            console.error(`Failed to get version for ${executable}: ${error}`);
            return null;
        }
        return version;
    };

    private versionCache = new Map<string, Promise<string | null>>();
}
