import sqlite3 from "bun:sqlite";
import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readMachineStats } from "./readMachineStats";

const SAMPLE_STATS = {
    composerAcceptedLines: 10,
    composerSuggestedLines: 20,
    date: "2024-06-14",
    tabAcceptedLines: 5,
    tabSuggestedLines: 15,
} as const;

const createVscdbFile = (rows: { key: string; value: string }[]) => {
    const dir = mkdtempSync(join(tmpdir(), "cursor-stats-readMachineStats-"));
    const dbPath = join(dir, "state.vscdb");
    const db = new sqlite3(dbPath);

    db.run("CREATE TABLE ItemTable (key TEXT PRIMARY KEY, value TEXT)");
    for (const row of rows) {
        db.run("INSERT INTO ItemTable (key, value) VALUES (?, ?)", [row.key, row.value]);
    }
    db.close();

    return { dbPath, dir };
};

describe("readMachineStats", () => {
    const tempDirs: string[] = [];

    afterEach(() => {
        for (const dir of tempDirs) {
            rmSync(dir, { force: true, recursive: true });
        }
        tempDirs.length = 0;
    });

    test("reads ai code tracking stats from a vscdb file", () => {
        const { dbPath, dir } = createVscdbFile([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
        ]);
        tempDirs.push(dir);

        const stats = readMachineStats(dbPath);

        expect(stats).toHaveLength(1);
        expect(stats[0]).toEqual({
            ...SAMPLE_STATS,
            date: new Date("2024-06-14"),
        });
    });

    test("wraps read errors in a TypeError with the db path", () => {
        const dir = mkdtempSync(join(tmpdir(), "cursor-stats-readMachineStats-"));
        const dbPath = join(dir, "state.vscdb");
        tempDirs.push(dir);

        new sqlite3(dbPath).close();

        expect(() => readMachineStats(dbPath)).toThrow(
            `Failed to read machine stats from ${dbPath}`,
        );
        expect(() => readMachineStats(dbPath)).toThrow(TypeError);
    });
});
