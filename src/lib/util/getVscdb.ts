import fs from "node:fs";
import os from "node:os";
import { join } from "node:path";

const VSCDB_TAIL = ["Cursor", "User", "globalStorage", "state.vscdb"] as const;

const getDefaultVscdbPath = () => {
    switch (os.platform()) {
        case "darwin":
            return join(os.homedir(), "Library", "Application Support", ...VSCDB_TAIL);
        case "win32": {
            const appData = process.env.APPDATA;
            if (!appData) {
                throw new Error("APPDATA environment variable is not set");
            }
            return join(appData, ...VSCDB_TAIL);
        }
        default:
            return join(os.homedir(), ".config", ...VSCDB_TAIL);
    }
};

const assertVscdbPath = (vscdbPath: string) => {
    if (!fs.existsSync(vscdbPath)) {
        throw new Error(`VSCDB path ${vscdbPath} does not exist`);
    }
    if (!vscdbPath.endsWith(".vscdb")) {
        throw new Error(`Invalid VSCDB path: ${vscdbPath}`);
    }

    return vscdbPath;
};

export const getVscdbPath = (vscdbPath?: string) =>
    assertVscdbPath(vscdbPath ?? getDefaultVscdbPath());
