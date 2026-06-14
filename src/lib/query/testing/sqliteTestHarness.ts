import { Database } from "bun:sqlite";

import { ONE, ZERO } from "../../util/constants";

type ItemTableRow = Readonly<{ key: string; value: string }>;

const SAMPLE_STATS = {
    composerAcceptedLines: 10,
    composerSuggestedLines: 20,
    date: "2024-06-14",
    tabAcceptedLines: 5,
    tabSuggestedLines: 15,
} as const;

const seedItemTable = (db: Readonly<Database>, rows: readonly ItemTableRow[]) => {
    db.run("CREATE TABLE ItemTable (key TEXT PRIMARY KEY, value TEXT)");
    for (const row of rows) {
        db.run("INSERT INTO ItemTable (key, value) VALUES (?, ?)", [row.key, row.value]);
    }
};

const createMemoryDatabase = (rows: readonly ItemTableRow[]) => {
    const db = new Database(":memory:");
    seedItemTable(db, rows);

    return db;
};

const SINGLE_ROW = ONE;
const EMPTY_LENGTH = ZERO;

export { createMemoryDatabase, EMPTY_LENGTH, SAMPLE_STATS, SINGLE_ROW };
