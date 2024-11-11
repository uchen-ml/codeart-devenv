import { spawn_process } from "./helpers";
import { CompilerFamily, Language } from "./types";

function getArguments(_family: CompilerFamily, language: Language) {
    return ["-dM", "-E", "-x", language == Language.C ? "c" : "c++", "-"];
}

function parseDefines(output: string) {
    const defines = new Map<string, string>();
    for (const line of output.split("\n")) {
        const match = line.match(/^#define ([^ ]+) (.*)$/);
        if (match !== null) {
            defines.set(match[1], match[2]);
        }
    }
    return defines;
}

class CompilerDefines {
    constructor(public readonly defines: Map<string, string>) {}

    static query = async (
        executable: string,
        family: CompilerFamily,
        language: Language,
    ) => {
        const { code, output } = await spawn_process([
            executable,
            ...getArguments(family, language),
        ]);
        if (code !== 0 || !output) {
            throw new Error(
                `Failed to query compiler ${executable}: ${output}`,
            );
        }
        return new CompilerDefines(parseDefines(output));
    };
}

export default class Defines {
    getCompilerDefines = async (
        executable: string,
        family: CompilerFamily,
        language: Language,
    ) => {
        if (!this.cache.has(executable)) {
            this.cache.set(
                executable,
                CompilerDefines.query(executable, family, language),
            );
        }
        return await this.cache.get(executable);
    };

    private cache: Map<string, Promise<CompilerDefines>> = new Map();
}
