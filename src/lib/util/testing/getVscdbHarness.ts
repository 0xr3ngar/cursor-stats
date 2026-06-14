import { mock, spyOn } from "bun:test";
import fs from "node:fs";
import os from "node:os";

const VSCDB_TAIL = ["Cursor", "User", "globalStorage", "state.vscdb"] as const;

const mockDefaultPathResolution = (platform: NodeJS.Platform, home: string, appData?: string) => {
    spyOn(os, "platform").mockReturnValue(platform);
    spyOn(os, "homedir").mockReturnValue(home);

    if (appData === undefined) {
        delete process.env.APPDATA;
    } else {
        process.env.APPDATA = appData;
    }

    spyOn(fs, "existsSync").mockReturnValue(true);
};

const restoreAppData = (originalAppData: string | undefined) => {
    mock.restore();

    if (originalAppData === undefined) {
        delete process.env.APPDATA;
    } else {
        process.env.APPDATA = originalAppData;
    }
};

export { mockDefaultPathResolution, restoreAppData, VSCDB_TAIL };
