import { z } from "zod";

import { MachineSnapshotSchema } from "./MachineSnapshotSchema";

export const AggregatedStatsSchema = z.object({
    daily: z.array(
        z.object({
            composerAccepted: z.number(),
            date: z.string(),
            tabAccepted: z.number(),
            totalAccepted: z.number(),
        }),
    ),
    machines: z.record(z.string(), MachineSnapshotSchema),
    meta: z.object({
        busiestDay: z.object({
            date: z.string(),
            tabAccepted: z.number(),
        }),
        streak: z.number(),
        trackingSince: z.string(),
    }),
    totals: z.object({
        composer: z.object({
            acceptanceRate: z.number(),
            accepted: z.number(),
            suggested: z.number(),
        }),
        tab: z.object({
            acceptanceRate: z.number(),
            accepted: z.number(),
            suggested: z.number(),
        }),
    }),
    updatedAt: z.string(),
});

export type AggregatedStats = z.infer<typeof AggregatedStatsSchema>;
