import { z } from "zod";

import type { ReadonlyDailyStats } from "./DailyStatsSchema";

const SnapshotDailyStatsSchema = z.object({
    composerAcceptedLines: z.number(),
    composerSuggestedLines: z.number(),
    date: z.date(),
    tabAcceptedLines: z.number(),
    tabSuggestedLines: z.number(),
});

const MachineSnapshotSchema = z.object({
    dailyStats: z.array(SnapshotDailyStatsSchema),
    machineId: z.string(),
    totals: z.object({
        composerAcceptedLines: z.number(),
        composerSuggestedLines: z.number(),
        tabAcceptedLines: z.number(),
        tabSuggestedLines: z.number(),
    }),
    username: z.string(),
});

type MachineSnapshot = z.infer<typeof MachineSnapshotSchema>;

interface ReadonlyMachineSnapshotTotals {
    readonly composerAcceptedLines: number;
    readonly composerSuggestedLines: number;
    readonly tabAcceptedLines: number;
    readonly tabSuggestedLines: number;
}

interface ReadonlyMachineSnapshot {
    readonly dailyStats: readonly ReadonlyDailyStats[];
    readonly machineId: string;
    readonly totals: ReadonlyMachineSnapshotTotals;
    readonly username: string;
}

export { MachineSnapshotSchema, type MachineSnapshot, type ReadonlyMachineSnapshot };
