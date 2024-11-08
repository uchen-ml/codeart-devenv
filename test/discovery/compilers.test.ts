import { getCompilerFamilyFromVersion } from "../../src/discovery/compilers";

describe("getCompilerFamilyFromVersion", () => {
    /*
    version: 'Apple clang version 16.0.0 (clang-1600.0.26.4)\n' +
      'Target: arm64-apple-darwin23.5.0\n' +
      'Thread model: posix\n' +
      'InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin',
    */
    it("should return null if version is null", () => {
        expect(getCompilerFamilyFromVersion(null)).toBeNull();
    });
});
