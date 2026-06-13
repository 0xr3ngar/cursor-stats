import type sqlite3 from "bun:sqlite";

import { z } from "zod";

const DAILY_PREFIX = "aiCodeTracking.dailyStats%";
const QUERY_SQL = "SELECT value FROM ItemTable WHERE key LIKE ? ORDER BY key";

const DailyStatsSchema = z.object({
    composerAcceptedLines: z.number(),
    composerSuggestedLines: z.number(),
    date: z.string().transform((val) => new Date(val)),
    tabAcceptedLines: z.number(),
    tabSuggestedLines: z.number(),
});

export const getAiCodeTrackingStats = (db: sqlite3) => {
    const rows = db.query<{ value: string }, [string]>(QUERY_SQL).all(DAILY_PREFIX);

    return rows.map((row) => DailyStatsSchema.parse(JSON.parse(row.value)));
};
