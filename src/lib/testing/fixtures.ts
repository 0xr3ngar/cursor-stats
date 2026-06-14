import { buildMachineSnapshot } from "../buildMachineSnapshot";
import type { ReadonlyDailyStats } from "../models/DailyStatsSchema";
import { ZERO } from "../util/constants";

const testIdentity = {
    machineId: "dev-mac-darwin-arm64",
} as const;

const dailyStat = (
    date: string,
    overrides: Readonly<Partial<Omit<ReadonlyDailyStats, "date">>> = {},
): ReadonlyDailyStats => ({
    composerAcceptedLines: ZERO,
    composerSuggestedLines: ZERO,
    date: new Date(date),
    tabAcceptedLines: ZERO,
    tabSuggestedLines: ZERO,
    ...overrides,
});

const machineSnapshot = (machineId: string, dailyStats: Readonly<readonly ReadonlyDailyStats[]>) =>
    buildMachineSnapshot({ machineId }, dailyStats);

export { dailyStat, machineSnapshot, testIdentity };
