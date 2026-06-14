import fs from "node:fs";
import os from "node:os";
import { join } from "node:path";

const VSCDB_TAIL = ["Cursor", "User", "globalStorage", "state.vscdb"] as const;

const isWindows = (platform: NodeJS.Platform): platform is "win32" => platform === "win32";

const isMacOs = (platform: NodeJS.Platform): platform is "darwin" => platform === "darwin";

const getMacOsVscdbPath = () => join(os.homedir(), "Library", "Application Support", ...VSCDB_TAIL);

const getWindowsVscdbPath = () => {
    const appData = process.env.APPDATA;

    if (appData === undefined || appData === "") {
        throw new Error("APPDATA environment variable is not set");
    }

    return join(appData, ...VSCDB_TAIL);
};

const getUnixVscdbPath = () => join(os.homedir(), ".config", ...VSCDB_TAIL);

const getDefaultVscdbPath = () => {
    const platform = os.platform();

    if (isMacOs(platform)) {
        return getMacOsVscdbPath();
    }

    if (isWindows(platform)) {
        return getWindowsVscdbPath();
    }

    return getUnixVscdbPath();
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
