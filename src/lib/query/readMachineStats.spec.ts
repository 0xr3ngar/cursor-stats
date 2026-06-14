import { afterEach, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";

import { ZERO } from "../util/constants";
import { readMachineStats } from "./readMachineStats";
import {
    createEmptyVscdbFile,
    createVscdbFile,
    EMPTY_LENGTH,
    SAMPLE_STATS,
    SINGLE_ROW,
} from "./testing/readMachineStatsHarness";

describe("readMachineStats", () => {
    const tempDirs: string[] = [];

    afterEach(() => {
        for (const dir of tempDirs) {
            rmSync(dir, { force: true, recursive: true });
        }
        tempDirs.length = EMPTY_LENGTH;
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

        expect(stats).toHaveLength(SINGLE_ROW);
        expect(stats[ZERO]).toEqual({
            ...SAMPLE_STATS,
            date: new Date("2024-06-14"),
        });
    });

    test("wraps read errors in an Error with the db path", () => {
        const { dbPath, dir } = createEmptyVscdbFile();
        tempDirs.push(dir);

        expect(() => readMachineStats(dbPath)).toThrow(
            `Failed to read machine stats from ${dbPath}`,
        );
        expect(() => readMachineStats(dbPath)).toThrow(Error);
    });
});
