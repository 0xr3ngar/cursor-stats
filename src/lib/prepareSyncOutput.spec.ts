import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getMachineIdentity } from "./getMachineIdentity";
import { prepareSyncOutput } from "./prepareSyncOutput";
import { SAMPLE_STATS, createVscdbFile } from "./query/testing/readMachineStatsHarness";
import { serializeMachineSnapshot } from "./snapshot/serializeMachineSnapshot";
import { dailyStat, machineSnapshot } from "./testing/fixtures";

const JSON_INDENT = 2;

describe("prepareSyncOutput", () => {
    test("merges the current machine with existing machines in the output directory", async () => {
        const { dbPath, dir: vscdbDir } = createVscdbFile([
            {
                key: "aiCodeTracking.dailyStats2024-06-14",
                value: JSON.stringify(SAMPLE_STATS),
            },
        ]);
        const outputDir = mkdtempSync(join(tmpdir(), "cursor-stats-prepareSyncOutput-"));
        const identity = getMachineIdentity();

        mkdirSync(join(outputDir, "machines"), { recursive: true });
        writeFileSync(
            join(outputDir, "machines", "other-machine.json"),
            `${JSON.stringify(
                serializeMachineSnapshot(
                    machineSnapshot("other-machine", [
                        dailyStat("2024-06-15", { tabAcceptedLines: 5 }),
                    ]),
                ),
                undefined,
                JSON_INDENT,
            )}\n`,
            "utf8",
        );

        try {
            const output = await prepareSyncOutput({
                outputDir,
                theme: {},
                visibility: {
                    showComposer: true,
                    showTab: true,
                },
                vscdbPath: dbPath,
            });
            const stats = output.files["stats.json"];

            expect(stats).toBeDefined();
            expect(typeof stats === "object" && "machines" in stats).toBe(true);

            if (typeof stats !== "object" || !("machines" in stats)) {
                throw new Error("Expected stats.json in sync output");
            }

            expect(Object.keys(output.files)).toEqual([
                `machines/${identity.machineId}.json`,
                "cursor-stats.png",
                "README.md",
                "stats.json",
            ]);
            expect(output.files["cursor-stats.png"]).toBeInstanceOf(Uint8Array);
            expect(stats.machines["other-machine"]).toBeDefined();
            expect(stats.machines[identity.machineId]).toBeDefined();
        } finally {
            rmSync(outputDir, { force: true, recursive: true });
            rmSync(vscdbDir, { force: true, recursive: true });
        }
    });
});
