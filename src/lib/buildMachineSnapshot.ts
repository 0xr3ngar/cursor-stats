import type { MachineIdentity } from "./getMachineIdentity";
import type { ReadonlyDailyStats } from "./models/DailyStatsSchema";
import { MachineSnapshotSchema } from "./models/MachineSnapshotSchema";
import { sumDailyField } from "./snapshot/sumDailyField";

export const buildMachineSnapshot = (
    identity: Readonly<MachineIdentity>,
    dailyStats: Readonly<readonly ReadonlyDailyStats[]>,
) =>
    MachineSnapshotSchema.parse({
        dailyStats,
        machineId: identity.machineId,
        totals: {
            composerAcceptedLines: sumDailyField(dailyStats, "composerAcceptedLines"),
            composerSuggestedLines: sumDailyField(dailyStats, "composerSuggestedLines"),
            tabAcceptedLines: sumDailyField(dailyStats, "tabAcceptedLines"),
            tabSuggestedLines: sumDailyField(dailyStats, "tabSuggestedLines"),
        },
        username: identity.username,
    });
