import type { ReadonlyMachineSnapshot } from "../models/MachineSnapshotSchema";
import { ZERO } from "../util/constants";
import { formatDate } from "../util/formatDate";
import { sortByDate } from "../util/sortByDate";
import type { AggregatedDailyRow } from "./types";

const emptyDailyRow = (date: string): AggregatedDailyRow => ({
    composerAccepted: ZERO,
    date,
    tabAccepted: ZERO,
    totalAccepted: ZERO,
});

export const mergeDailyRows = (
    snapshots: Readonly<readonly ReadonlyMachineSnapshot[]>,
): AggregatedDailyRow[] => {
    const dailyByDate = new Map<string, AggregatedDailyRow>();

    for (const snapshot of snapshots) {
        for (const day of snapshot.dailyStats) {
            const date = formatDate(day.date);
            const existing = dailyByDate.get(date) ?? emptyDailyRow(date);
            const tabAccepted = existing.tabAccepted + day.tabAcceptedLines;
            const composerAccepted = existing.composerAccepted + day.composerAcceptedLines;

            dailyByDate.set(date, {
                composerAccepted,
                date,
                tabAccepted,
                totalAccepted: tabAccepted + composerAccepted,
            });
        }
    }

    return sortByDate([...dailyByDate.values()]);
};
