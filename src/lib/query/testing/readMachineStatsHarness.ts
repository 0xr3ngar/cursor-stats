import { Database } from "bun:sqlite";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { EMPTY_LENGTH, SAMPLE_STATS, SINGLE_ROW } from "./sqliteTestHarness";

type ItemTableRow = Readonly<{ key: string; value: string }>;

const createVscdbFile = (rows: readonly ItemTableRow[]) => {
    const dir = mkdtempSync(join(tmpdir(), "cursor-stats-readMachineStats-"));
    const dbPath = join(dir, "state.vscdb");
    const db = new Database(dbPath);

    db.run("CREATE TABLE ItemTable (key TEXT PRIMARY KEY, value TEXT)");
    for (const row of rows) {
        db.run("INSERT INTO ItemTable (key, value) VALUES (?, ?)", [row.key, row.value]);
    }
    db.close();

    return { dbPath, dir };
};

const createEmptyVscdbFile = () => {
    const dir = mkdtempSync(join(tmpdir(), "cursor-stats-readMachineStats-"));
    const dbPath = join(dir, "state.vscdb");
    new Database(dbPath).close();

    return { dbPath, dir };
};

export { createEmptyVscdbFile, createVscdbFile, EMPTY_LENGTH, SAMPLE_STATS, SINGLE_ROW };
