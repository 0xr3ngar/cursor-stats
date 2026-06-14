import type { ReadonlyDailyStats } from "../models/DailyStatsSchema";
import { ZERO } from "../util/constants";

export type NumericDailyField =
    | "composerAcceptedLines"
    | "composerSuggestedLines"
    | "tabAcceptedLines"
    | "tabSuggestedLines";

export const sumDailyField = (
    dailyStats: Readonly<readonly ReadonlyDailyStats[]>,
    field: NumericDailyField,
) => dailyStats.reduce((sum: number, day: Readonly<ReadonlyDailyStats>) => sum + day[field], ZERO);
