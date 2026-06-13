import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import { join } from "node:path";

import { getVscdbPath } from "./getVscdb";

const VSCDB_TAIL = ["Cursor", "User", "globalStorage", "state.vscdb"] as const;

const mockDefaultPathResolution = (platform: NodeJS.Platform, home: string, appData?: string) => {
    spyOn(os, "platform").mockReturnValue(platform);
    spyOn(os, "homedir").mockReturnValue(home);

    if (appData !== undefined) {
        process.env.APPDATA = appData;
    } else {
        delete process.env.APPDATA;
    }

    spyOn(fs, "existsSync").mockReturnValue(true);
};

describe("getVscdbPath", () => {
    const originalAppData = process.env.APPDATA;

    afterEach(() => {
        mock.restore();

        if (originalAppData === undefined) {
            delete process.env.APPDATA;
        } else {
            process.env.APPDATA = originalAppData;
        }
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
        expect(os.homedir).toHaveBeenCalledTimes(1);
        expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    test("builds the default Linux path from homedir when no path is provided", () => {
        const home = "/home/alice";
        const expectedPath = join(home, ".config", ...VSCDB_TAIL);

        mockDefaultPathResolution("linux", home);

        expect(getVscdbPath()).toBe(expectedPath);
        expect(os.homedir).toHaveBeenCalledTimes(1);
        expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    test("builds the default Windows path from APPDATA when no path is provided", () => {
        const appData = "C:\\Users\\alice\\AppData\\Roaming";
        const expectedPath = join(appData, ...VSCDB_TAIL);

        mockDefaultPathResolution("win32", "C:\\Users\\alice", appData);

        expect(getVscdbPath()).toBe(expectedPath);
        expect(os.homedir).not.toHaveBeenCalled();
        expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    test("throws on Windows when APPDATA is not set", () => {
        mockDefaultPathResolution("win32", "C:\\Users\\alice");

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
