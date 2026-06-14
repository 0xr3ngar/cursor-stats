import { afterEach, describe, expect, test } from "bun:test";

import type { ReadonlyDailyStats } from "../models/DailyStatsSchema";
import { ISO_DATE_LENGTH, ZERO } from "../util/constants";
import { getAiCodeTrackingStats } from "./getAiCodeTrackingStats";
import {
    createMemoryDatabase,
    EMPTY_LENGTH,
    SAMPLE_STATS,
    SINGLE_ROW,
} from "./testing/sqliteTestHarness";

describe("getAiCodeTrackingStats", () => {
    const dbs: ReturnType<typeof createMemoryDatabase>[] = [];

    afterEach(() => {
        for (const db of dbs) {
            db.close();
        }
        dbs.length = EMPTY_LENGTH;
    });

    test("returns parsed daily stats for matching keys", () => {
        const db = createMemoryDatabase([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
        ]);
        dbs.push(db);

        const stats = getAiCodeTrackingStats(db);

        expect(stats).toHaveLength(SINGLE_ROW);
        expect(stats[ZERO]).toEqual({
            ...SAMPLE_STATS,
            date: new Date("2024-06-14"),
        });
    });

    test("ignores rows whose keys do not match the daily stats prefix", () => {
        const db = createMemoryDatabase([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
            {
                key: "other.key",
                value: JSON.stringify({ ignored: true }),
            },
        ]);
        dbs.push(db);

        expect(getAiCodeTrackingStats(db)).toHaveLength(SINGLE_ROW);
    });

    test("returns rows ordered by key", () => {
        const db = createMemoryDatabase([
            {
                key: "aiCodeTracking.dailyStats2024-06-16",
                value: JSON.stringify({ ...SAMPLE_STATS, date: "2024-06-16" }),
            },
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
        ]);
        dbs.push(db);

        const stats = getAiCodeTrackingStats(db);

        expect(
            stats.map((stat: Readonly<ReadonlyDailyStats>) =>
                stat.date.toISOString().slice(ZERO, ISO_DATE_LENGTH),
            ),
        ).toEqual(["2024-06-14", "2024-06-16"]);
    });

    test("throws when a row value is not valid JSON", () => {
        const db = createMemoryDatabase([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: "not-json",
            },
        ]);
        dbs.push(db);

        expect(() => getAiCodeTrackingStats(db)).toThrow(SyntaxError);
    });

    test("throws when a row value does not match the daily stats schema", () => {
        const db = createMemoryDatabase([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify({ date: "2024-06-14" }),
            },
        ]);
        dbs.push(db);

        expect(() => getAiCodeTrackingStats(db)).toThrow();
    });
});
