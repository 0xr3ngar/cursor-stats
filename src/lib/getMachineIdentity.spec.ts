import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import os from "node:os";

import { getMachineIdentity } from "./getMachineIdentity";

const mockOsIdentity = (
    overrides: {
        username?: string;
        hostname?: string;
        platform?: NodeJS.Platform;
        arch?: NodeJS.Architecture;
    } = {},
) => {
    const {
        username = "alice",
        hostname = "dev-mac",
        platform = "darwin",
        arch = "arm64",
    } = overrides;

    spyOn(os, "userInfo").mockReturnValue({
        gid: 20,
        homedir: "/Users/alice",
        shell: "/bin/zsh",
        uid: 501,
        username,
    });
    spyOn(os, "hostname").mockReturnValue(hostname);
    spyOn(os, "platform").mockReturnValue(platform);
    spyOn(os, "arch").mockReturnValue(arch);
};

describe("getMachineIdentity", () => {
    afterEach(() => {
        mock.restore();
    });

    test("returns username and a hyphenated machineId", () => {
        mockOsIdentity();

        expect(getMachineIdentity()).toEqual({
            machineId: "dev-mac-darwin-arm64",
            username: "alice",
        });
    });

    test("builds machineId from hostname, platform, and arch", () => {
        mockOsIdentity({
            arch: "x64",
            hostname: "ci-runner-01",
            platform: "linux",
        });

        expect(getMachineIdentity().machineId).toBe("ci-runner-01-linux-x64");
    });

    test("reads the username from os.userInfo()", () => {
        mockOsIdentity({ username: "bob" });

        expect(getMachineIdentity().username).toBe("bob");
    });

    test("calls each os helper exactly once", () => {
        mockOsIdentity();

        getMachineIdentity();

        expect(os.userInfo).toHaveBeenCalledTimes(1);
        expect(os.hostname).toHaveBeenCalledTimes(1);
        expect(os.platform).toHaveBeenCalledTimes(1);
        expect(os.arch).toHaveBeenCalledTimes(1);
    });
});
