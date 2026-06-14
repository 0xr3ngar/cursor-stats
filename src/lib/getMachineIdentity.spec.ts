import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import os from "os";

import { getMachineIdentity } from "./getMachineIdentity";
import { ONE } from "./util/constants";

const ONCE = ONE;

const mockOsIdentity = (
    overrides: Readonly<{
        arch?: NodeJS.Architecture;
        hostname?: string;
        platform?: NodeJS.Platform;
    }> = {},
) => {
    const { hostname = "dev-mac", platform = "darwin", arch = "arm64" } = overrides;

    spyOn(os, "hostname").mockReturnValue(hostname);
    spyOn(os, "platform").mockReturnValue(platform);
    spyOn(os, "arch").mockReturnValue(arch);
};

describe("getMachineIdentity", () => {
    afterEach(() => {
        mock.restore();
    });

    test("returns a hyphenated machineId", () => {
        mockOsIdentity();

        expect(getMachineIdentity()).toEqual({
            machineId: "dev-mac-darwin-arm64",
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

    test("calls each os helper exactly once", () => {
        mockOsIdentity();

        getMachineIdentity();

        expect(os.hostname).toHaveBeenCalledTimes(ONCE);
        expect(os.platform).toHaveBeenCalledTimes(ONCE);
        expect(os.arch).toHaveBeenCalledTimes(ONCE);
    });
});
