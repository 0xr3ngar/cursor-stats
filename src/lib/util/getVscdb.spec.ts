import { afterEach, describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs";
import { join } from "node:path";

import { getVscdbPath } from "./getVscdb";
import { mockDefaultPathResolution, restoreAppData, VSCDB_TAIL } from "./testing/getVscdbHarness";

describe("getVscdbPath", () => {
    const originalAppData = process.env.APPDATA;

    afterEach(() => {
        restoreAppData(originalAppData);
    });

    test("returns the provided path when it exists and ends with .vscdb", () => {
        const vscdbPath = "/custom/path/state.vscdb";
        spyOn(fs, "existsSync").mockReturnValue(true);

        expect(getVscdbPath(vscdbPath)).toBe(vscdbPath);
        expect(fs.existsSync).toHaveBeenCalledWith(vscdbPath);
    });

    test("builds the default macOS path from homedir when no path is provided", () => {
        const home = "/Users/alice";
        const expectedPath = join(home, "Library", "Application Support", ...VSCDB_TAIL);

        mockDefaultPathResolution("darwin", home);

        expect(getVscdbPath()).toBe(expectedPath);
        expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    test("builds the default Linux path from homedir when no path is provided", () => {
        const home = "/home/alice";
        const expectedPath = join(home, ".config", ...VSCDB_TAIL);

        mockDefaultPathResolution("linux", home);

        expect(getVscdbPath()).toBe(expectedPath);
        expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    test("builds the default Windows path from APPDATA when no path is provided", () => {
        const appData = String.raw`C:\Users\alice\AppData\Roaming`;
        const expectedPath = join(appData, ...VSCDB_TAIL);

        mockDefaultPathResolution("win32", String.raw`C:\Users\alice`, appData);

        expect(getVscdbPath()).toBe(expectedPath);
        expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    test("throws on Windows when APPDATA is not set", () => {
        mockDefaultPathResolution("win32", String.raw`C:\Users\alice`);

        expect(() => getVscdbPath()).toThrow("APPDATA environment variable is not set");
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
