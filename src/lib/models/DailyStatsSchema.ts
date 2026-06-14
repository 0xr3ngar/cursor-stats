import { z } from "zod";

const DailyStatsSchema = z.object({
    composerAcceptedLines: z.number(),
    composerSuggestedLines: z.number(),
    date: z.string().transform((val) => new Date(val)),
    tabAcceptedLines: z.number(),
    tabSuggestedLines: z.number(),
});

type DailyStats = z.infer<typeof DailyStatsSchema>;

interface ReadonlyDailyStats {
    readonly composerAcceptedLines: number;
    readonly composerSuggestedLines: number;
    readonly date: Readonly<Date>;
    readonly tabAcceptedLines: number;
    readonly tabSuggestedLines: number;
}

export { DailyStatsSchema, type DailyStats, type ReadonlyDailyStats };
