import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import { join } from "node:path";

import { getVscdbPath } from "./getVscdb";

const DEFAULT_VSCDB_SEGMENTS = [
    "Library",
    "Application Support",
    "Cursor",
    "User",
    "globalStorage",
    "state.vscdb",
] as const;

describe("getVscdbPath", () => {
    afterEach(() => {
        mock.restore();
    });

    test("returns the provided path when it exists and ends with .vscdb", () => {
        const vscdbPath = "/custom/path/state.vscdb";
        spyOn(fs, "existsSync").mockReturnValue(true);

        expect(getVscdbPath(vscdbPath)).toBe(vscdbPath);
        expect(fs.existsSync).toHaveBeenCalledWith(vscdbPath);
    });

    test("builds the default path from homedir when no path is provided", () => {
        const home = "/Users/alice";
        const expectedPath = join(home, ...DEFAULT_VSCDB_SEGMENTS);

        spyOn(os, "homedir").mockReturnValue(home);
        spyOn(fs, "existsSync").mockReturnValue(true);

        expect(getVscdbPath()).toBe(expectedPath);
        expect(os.homedir).toHaveBeenCalledTimes(1);
        expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    test("throws when the path does not exist", () => {
        const vscdbPath = "/missing/state.vscdb";
        spyOn(fs, "existsSync").mockReturnValue(false);

        expect(() => getVscdbPath(vscdbPath)).toThrow(`VSCDB path ${vscdbPath} does not exist`);
    });

    test("throws when the path does not end with .vscdb", () => {
        const vscdbPath = "/custom/path/state.db";
        spyOn(fs, "existsSync").mockReturnValue(true);

        expect(() => getVscdbPath(vscdbPath)).toThrow(`Invalid VSCDB path: ${vscdbPath}`);
    });
});
