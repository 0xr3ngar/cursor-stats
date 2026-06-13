import fs from "node:fs";
import os from "node:os";
import { join } from "node:path";

const DEFAULT_VSCDB_PATH = [
    "Library",
    "Application Support",
    "Cursor",
    "User",
    "globalStorage",
    "state.vscdb",
];

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
    assertVscdbPath(vscdbPath ?? join(os.homedir(), ...DEFAULT_VSCDB_PATH));
