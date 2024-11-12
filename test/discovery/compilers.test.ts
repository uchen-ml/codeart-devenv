import Compilers, {
    getCompilerFamilyFromVersion,
} from "../../src/discovery/compilers";
import { realPath, spawnProcess } from "../../src/discovery/helpers";
import { CompilerFamily } from "../../src/discovery/types";

const APPLE_CLANG =
    "Apple clang version 16.0.0 (clang-1600.0.26.4)\n" +
    "Target: arm64-apple-darwin23.5.0\n" +
    "Thread model: posix\n" +
    "InstalledDir: /Applications/Xcode.app/Contents/Developer/" +
    "Toolchains/XcodeDefault.xctoolchain/usr/bin";

const UBUNTU_CPP =
    "c++ (Ubuntu 13.2.0-23ubuntu4) 13.2.0\n" +
    "Copyright (C) 2023 Free Software Foundation, Inc.\n" +
    "This is free software; see the source " +
    "for copying conditions.  There is NO\n" +
    "warranty; not even for MERCHANTABILITY " +
    "or FITNESS FOR A PARTICULAR PURPOSE.";

const UBUNTU_GCC =
    "gcc-13 (Ubuntu 13.2.0-23ubuntu4) 13.2.0\n" +
    "Copyright (C) 2023 Free Software Foundation, Inc.\n" +
    "This is free software; see the source " +
    "for copying conditions.  There is NO\n" +
    "warranty; not even for MERCHANTABILITY " +
    "or FITNESS FOR A PARTICULAR PURPOSE.";

const UBUNTU_CLANG =
    "Ubuntu clang version 18.1.3 (1ubuntu1)\n" +
    "Target: x86_64-pc-linux-gnu\n" +
    "Thread model: posix\n" +
    "InstalledDir: /usr/bin";

describe("getCompilerFamilyFromVersion", () => {
    test.each([APPLE_CLANG, UBUNTU_CLANG])(
        "should return Clang for %s",
        (version) => {
            expect(getCompilerFamilyFromVersion(version)).toBe(
                CompilerFamily.Clang,
            );
        },
    );

    test.each([UBUNTU_CPP, UBUNTU_GCC])(
        "should return GCC for %s",
        (version) => {
            expect(getCompilerFamilyFromVersion(version)).toBe(
                CompilerFamily.GCC,
            );
        },
    );

    describe("discover", () => {
        const mockSpawnProcess = jest.fn(spawnProcess);
        const mockRealPath = jest.fn(realPath);

        it("discovers the compiler", async () => {
            mockSpawnProcess.mockResolvedValue({
                output: UBUNTU_CLANG,
                error: "",
                code: 0,
            });
            mockRealPath.mockResolvedValue("/usr/bin/made-up-compiler");
            const compilers = new Compilers(mockSpawnProcess, mockRealPath);
            await expect(compilers.discover("so-fake")).resolves.toStrictEqual({
                command: "so-fake",
                family: "Clang",
                language: "C++",
                path: "/usr/bin/made-up-compiler",
                version: UBUNTU_CLANG,
            });
        });
    });
});
