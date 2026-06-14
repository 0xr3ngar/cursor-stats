import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { aggregateSnapshots } from "./aggregate/aggregateSnapshots";
import { buildMachineSnapshot } from "./buildMachineSnapshot";
import { getMachineIdentity } from "./getMachineIdentity";
import { readMachineSnapshotsFromDir } from "./io/readMachineSnapshotsFromDir";
import { readMachineStats } from "./query/readMachineStats";
import { injectReadmeSection } from "./render/injectReadmeSection";
import { CARD_IMAGE_NAME, renderReadme } from "./render/renderReadme";
import {
    type CardTheme,
    renderStatsCard,
    type StatsCardVisibility,
} from "./render/renderStatsCard";
import { serializeMachineSnapshot } from "./snapshot/serializeMachineSnapshot";

interface PrepareSyncOutputOptions {
    outputDir: string;
    theme: Readonly<Partial<CardTheme>>;
    visibility: Readonly<StatsCardVisibility>;
    vscdbPath?: string;
}

export const prepareSyncOutput = async ({
    outputDir,
    theme,
    visibility,
    vscdbPath,
}: Readonly<PrepareSyncOutputOptions>) => {
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

    const readmePath = join(outputDir, "README.md");
    const existingReadme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
    const readme = injectReadmeSection(existingReadme, renderReadme());
    const card = await renderStatsCard(stats, visibility, theme);

    return {
        files: {
            [`machines/${currentSnapshot.machineId}.json`]:
                serializeMachineSnapshot(currentSnapshot),
            [CARD_IMAGE_NAME]: card,
            "README.md": readme,
            "stats.json": serializedStats,
        },
    };
};
