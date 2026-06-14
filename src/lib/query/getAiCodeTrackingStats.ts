import type { Database } from "bun:sqlite";

import { DailyStatsSchema } from "../models/DailyStatsSchema";

const DAILY_PREFIX = "aiCodeTracking.dailyStats%";
const QUERY_SQL = "SELECT value FROM ItemTable WHERE key LIKE ? ORDER BY key";

type Row = Readonly<{ value: string }>;

export const getAiCodeTrackingStats = (db: Readonly<Database>) => {
    const rows = db.query<Row, [string]>(QUERY_SQL).all(DAILY_PREFIX);

    return rows.map((row: Row) => DailyStatsSchema.parse(JSON.parse(row.value)));
};
