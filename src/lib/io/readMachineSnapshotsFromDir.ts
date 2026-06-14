import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { MachineSnapshot } from "../models/MachineSnapshotSchema";
import { parseMachineSnapshot } from "../snapshot/serializeMachineSnapshot";

export const readMachineSnapshotsFromDir = (machinesDir: string): MachineSnapshot[] => {
    if (!existsSync(machinesDir)) {
        return [];
    }

    return readdirSync(machinesDir)
        .filter((entry) => entry.endsWith(".json"))
        .map((entry) => {
            const contents = readFileSync(join(machinesDir, entry), "utf8");

            return parseMachineSnapshot(JSON.parse(contents));
        });
};
