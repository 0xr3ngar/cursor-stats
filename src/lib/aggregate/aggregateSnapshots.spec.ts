import { describe, expect, test } from "bun:test";

import {
    MERGE_DAY_ONE_COMPOSER,
    MERGE_DAY_ONE_TAB,
    MERGE_DAY_ONE_TOTAL,
    MERGE_DAY_TWO_COMPOSER,
    MERGE_DAY_TWO_TAB,
    MERGE_DAY_TWO_TOTAL,
} from "../testing/expectations";
import { dailyStat, machineSnapshot } from "../testing/fixtures";
import { ZERO } from "../util/constants";
import { aggregateSnapshots } from "./aggregateSnapshots";
import { mergeDailyRows } from "./mergeDailyRows";

const ONE_DAY = 1;
const TWO_DAYS = 2;
const FIFTY_FIVE_TAB_ACCEPTED = 55;
const ONE_HUNDRED_SEVENTY_COMPOSER_ACCEPTED = 170;

describe("aggregateSnapshots", () => {
    test("returns empty aggregates when given no snapshots", () => {
        const result = aggregateSnapshots([]);

        expect(result.daily).toEqual([]);
        expect(result.machines).toEqual({});
        expect(result.totals).toEqual({
            composer: {
                acceptanceRate: ZERO,
                accepted: ZERO,
                suggested: ZERO,
            },
            tab: {
                acceptanceRate: ZERO,
                accepted: ZERO,
                suggested: ZERO,
            },
        });
        expect(result.meta).toEqual({
            busiestDay: { date: "", tabAccepted: ZERO },
            streak: ZERO,
            trackingSince: "",
        });
    });

    test("aggregates a single machine snapshot", () => {
        const result = aggregateSnapshots([
            machineSnapshot("dev-mac-darwin-arm64", [
                dailyStat("2024-06-14", {
                    composerAcceptedLines: 607,
                    composerSuggestedLines: 700,
                    tabAcceptedLines: 34,
                    tabSuggestedLines: 100,
                }),
            ]),
        ]);

        expect(result.totals.tab).toEqual({
            acceptanceRate: 34,
            accepted: 34,
            suggested: 100,
        });
        expect(result.totals.composer).toEqual({
            acceptanceRate: 86.7,
            accepted: 607,
            suggested: 700,
        });
        expect(result.daily).toHaveLength(ONE_DAY);
        expect(result.daily).toEqual([
            {
                composerAccepted: 607,
                date: "2024-06-14",
                tabAccepted: 34,
                totalAccepted: 641,
            },
        ]);
        expect(result.meta.trackingSince).toBe("2024-06-14");
    });

    test("merges totals across multiple machines", () => {
        const result = aggregateSnapshots([
            machineSnapshot("machine-a", [
                dailyStat("2024-06-14", {
                    composerAcceptedLines: 100,
                    tabAcceptedLines: 10,
                }),
            ]),
            machineSnapshot("machine-b", [
                dailyStat("2024-06-14", {
                    composerAcceptedLines: 50,
                    tabAcceptedLines: 5,
                }),
                dailyStat("2024-06-15", {
                    composerAcceptedLines: 20,
                    tabAcceptedLines: 40,
                }),
            ]),
        ]);

        expect(result.totals.tab.accepted).toBe(FIFTY_FIVE_TAB_ACCEPTED);
        expect(result.totals.composer.accepted).toBe(ONE_HUNDRED_SEVENTY_COMPOSER_ACCEPTED);
        expect(result.daily).toHaveLength(TWO_DAYS);
        expect(Object.keys(result.machines)).toEqual(["machine-a", "machine-b"]);
    });
});

describe("mergeDailyRows", () => {
    test("merges rows with the same date across machines", () => {
        expect(
            mergeDailyRows([
                machineSnapshot("machine-a", [
                    dailyStat("2024-06-14", {
                        composerAcceptedLines: 100,
                        tabAcceptedLines: 10,
                    }),
                ]),
                machineSnapshot("machine-b", [
                    dailyStat("2024-06-14", {
                        composerAcceptedLines: 50,
                        tabAcceptedLines: 5,
                    }),
                    dailyStat("2024-06-15", {
                        composerAcceptedLines: 20,
                        tabAcceptedLines: 40,
                    }),
                ]),
            ]),
        ).toEqual([
            {
                composerAccepted: MERGE_DAY_ONE_COMPOSER,
                date: "2024-06-14",
                tabAccepted: MERGE_DAY_ONE_TAB,
                totalAccepted: MERGE_DAY_ONE_TOTAL,
            },
            {
                composerAccepted: MERGE_DAY_TWO_COMPOSER,
                date: "2024-06-15",
                tabAccepted: MERGE_DAY_TWO_TAB,
                totalAccepted: MERGE_DAY_TWO_TOTAL,
            },
        ]);
    });
});
