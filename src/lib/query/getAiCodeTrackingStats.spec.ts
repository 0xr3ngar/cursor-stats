import sqlite3 from "bun:sqlite";
import { afterEach, describe, expect, test } from "bun:test";

import { getAiCodeTrackingStats } from "./getAiCodeTrackingStats";

const SAMPLE_STATS = {
    composerAcceptedLines: 10,
    composerSuggestedLines: 20,
    date: "2024-06-14",
    tabAcceptedLines: 5,
    tabSuggestedLines: 15,
} as const;

const seedItemTable = (db: sqlite3, rows: { key: string; value: string }[]) => {
    db.run("CREATE TABLE ItemTable (key TEXT PRIMARY KEY, value TEXT)");
    for (const row of rows) {
        db.run("INSERT INTO ItemTable (key, value) VALUES (?, ?)", [row.key, row.value]);
    }
};

describe("getAiCodeTrackingStats", () => {
    const dbs: sqlite3[] = [];

    afterEach(() => {
        for (const db of dbs) {
            db.close();
        }
        dbs.length = 0;
    });

    const openMemoryDb = (rows: { key: string; value: string }[]) => {
        const db = new sqlite3(":memory:");
        seedItemTable(db, rows);
        dbs.push(db);
        return db;
    };

    test("returns parsed daily stats for matching keys", () => {
        const db = openMemoryDb([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
        ]);

        const stats = getAiCodeTrackingStats(db);

        expect(stats).toHaveLength(1);
        expect(stats[0]).toEqual({
            ...SAMPLE_STATS,
            date: new Date("2024-06-14"),
        });
    });

    test("ignores rows whose keys do not match the daily stats prefix", () => {
        const db = openMemoryDb([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
            {
                key: "other.key",
                value: JSON.stringify({ ignored: true }),
            },
        ]);

        expect(getAiCodeTrackingStats(db)).toHaveLength(1);
    });

    test("returns rows ordered by key", () => {
        const db = openMemoryDb([
            {
                key: "aiCodeTracking.dailyStats2024-06-16",
                value: JSON.stringify({ ...SAMPLE_STATS, date: "2024-06-16" }),
            },
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
        ]);

        const stats = getAiCodeTrackingStats(db);

        expect(stats.map((stat) => stat.date.toISOString().slice(0, 10))).toEqual([
            "2024-06-14",
            "2024-06-16",
        ]);
    });

    test("throws when a row value is not valid JSON", () => {
        const db = openMemoryDb([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: "not-json",
            },
        ]);

        expect(() => getAiCodeTrackingStats(db)).toThrow(SyntaxError);
    });

    test("throws when a row value does not match the daily stats schema", () => {
        const db = openMemoryDb([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify({ date: "2024-06-14" }),
            },
        ]);

        expect(() => getAiCodeTrackingStats(db)).toThrow();
    });
});
