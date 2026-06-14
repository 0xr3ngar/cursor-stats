import { calculateStreak } from "../metrics/calculateStreak";
import { findBusiestDay } from "../metrics/findBusiestDay";
import { AggregatedStatsSchema } from "../models/AggregatedStatsSchema";
import type { ReadonlyMachineSnapshot } from "../models/MachineSnapshotSchema";
import { ZERO } from "../util/constants";
import { buildMetricTotals, type MetricInputs } from "./buildMetricTotals";
import { mergeDailyRows } from "./mergeDailyRows";

export const aggregateSnapshots = (snapshots: Readonly<readonly ReadonlyMachineSnapshot[]>) => {
    const daily = mergeDailyRows(snapshots);

    const summedTotals = snapshots.reduce(
        (totals: MetricInputs, snapshot: Readonly<ReadonlyMachineSnapshot>) => ({
            composerAccepted: totals.composerAccepted + snapshot.totals.composerAcceptedLines,
            composerSuggested: totals.composerSuggested + snapshot.totals.composerSuggestedLines,
            tabAccepted: totals.tabAccepted + snapshot.totals.tabAcceptedLines,
            tabSuggested: totals.tabSuggested + snapshot.totals.tabSuggestedLines,
        }),
        {
            composerAccepted: ZERO,
            composerSuggested: ZERO,
            tabAccepted: ZERO,
            tabSuggested: ZERO,
        },
    );

    const trackingSince = daily[ZERO]?.date ?? "";

    const machines = Object.fromEntries(
        snapshots.map((snapshot: Readonly<ReadonlyMachineSnapshot>) => [
            snapshot.machineId,
            snapshot,
        ]),
    );

    return AggregatedStatsSchema.parse({
        daily,
        machines,
        meta: {
            busiestDay: findBusiestDay(daily),
            streak: calculateStreak(daily),
            trackingSince,
        },
        totals: buildMetricTotals(summedTotals),
        updatedAt: new Date().toISOString(),
    });
};
