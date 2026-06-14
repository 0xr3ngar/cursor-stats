import { describe, expect, test } from "bun:test";

import { buildMachineSnapshot } from "./buildMachineSnapshot";
import { dailyStat, testIdentity } from "./testing/fixtures";
import { ZERO } from "./util/constants";

describe("buildMachineSnapshot", () => {
    test("builds a snapshot with identity and zero totals for empty daily stats", () => {
        expect(buildMachineSnapshot(testIdentity, [])).toEqual({
            dailyStats: [],
            machineId: "dev-mac-darwin-arm64",
            totals: {
                composerAcceptedLines: ZERO,
                composerSuggestedLines: ZERO,
                tabAcceptedLines: ZERO,
                tabSuggestedLines: ZERO,
            },
            username: "alice",
        });
    });

    test("sums totals across multiple daily rows", () => {
        const snapshot = buildMachineSnapshot(testIdentity, [
            dailyStat("2024-06-14", {
                composerAcceptedLines: 10,
                composerSuggestedLines: 20,
                tabAcceptedLines: 5,
                tabSuggestedLines: 15,
            }),
            dailyStat("2024-06-15", {
                composerAcceptedLines: 30,
                composerSuggestedLines: 40,
                tabAcceptedLines: 7,
                tabSuggestedLines: 9,
            }),
        ]);

        expect(snapshot.totals).toEqual({
            composerAcceptedLines: 40,
            composerSuggestedLines: 60,
            tabAcceptedLines: 12,
            tabSuggestedLines: 24,
        });
    });

    test("preserves daily rows without transforming them", () => {
        const dailyStats = [
            dailyStat("2024-06-14", {
                composerAcceptedLines: 10,
                tabAcceptedLines: 5,
            }),
        ];

        expect(buildMachineSnapshot(testIdentity, dailyStats).dailyStats).toEqual(dailyStats);
    });
});
