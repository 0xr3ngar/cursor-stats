import { join } from "node:path";

import { aggregateSnapshots } from "./aggregate/aggregateSnapshots";
import { buildMachineSnapshot } from "./buildMachineSnapshot";
import { getMachineIdentity } from "./getMachineIdentity";
import { readMachineSnapshotsFromDir } from "./io/readMachineSnapshotsFromDir";
import { readMachineStats } from "./query/readMachineStats";
import { serializeMachineSnapshot } from "./snapshot/serializeMachineSnapshot";

interface PrepareSyncOutputOptions {
    outputDir: string;
    vscdbPath?: string;
}

export const prepareSyncOutput = ({ outputDir, vscdbPath }: PrepareSyncOutputOptions) => {
    const dailyStats = readMachineStats(vscdbPath);
    const identity = getMachineIdentity();
    const currentSnapshot = buildMachineSnapshot(identity, dailyStats);

    const existingSnapshots = readMachineSnapshotsFromDir(join(outputDir, "machines"));
    const otherSnapshots = existingSnapshots.filter(
        (snapshot) => snapshot.machineId !== currentSnapshot.machineId,
    );
    const allSnapshots = [...otherSnapshots, currentSnapshot];

    const stats = aggregateSnapshots(allSnapshots);
    const serializedStats = {
        ...stats,
        machines: Object.fromEntries(
            Object.entries(stats.machines).map(([machineId, snapshot]) => [
                machineId,
                serializeMachineSnapshot(snapshot),
            ]),
        ),
    };

    return {
        files: {
            [`machines/${currentSnapshot.machineId}.json`]:
                serializeMachineSnapshot(currentSnapshot),
            "stats.json": serializedStats,
        },
    };
};
