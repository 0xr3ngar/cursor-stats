import { z } from "zod";

import { MachineSnapshotSchema, type MachineSnapshot } from "../models/MachineSnapshotSchema";
import { formatDate } from "../util/formatDate";

const MachineSnapshotFileSchema = z.object({
    dailyStats: z.array(
        z.object({
            composerAcceptedLines: z.number(),
            composerSuggestedLines: z.number(),
            date: z.string(),
            tabAcceptedLines: z.number(),
            tabSuggestedLines: z.number(),
        }),
    ),
    machineId: z.string(),
    totals: z.object({
        composerAcceptedLines: z.number(),
        composerSuggestedLines: z.number(),
        tabAcceptedLines: z.number(),
        tabSuggestedLines: z.number(),
    }),
});

type SerializedMachineSnapshot = z.infer<typeof MachineSnapshotFileSchema>;

const serializeMachineSnapshot = (
    snapshot: Readonly<MachineSnapshot>,
): SerializedMachineSnapshot => ({
    dailyStats: snapshot.dailyStats.map((day) => ({
        composerAcceptedLines: day.composerAcceptedLines,
        composerSuggestedLines: day.composerSuggestedLines,
        date: formatDate(day.date),
        tabAcceptedLines: day.tabAcceptedLines,
        tabSuggestedLines: day.tabSuggestedLines,
    })),
    machineId: snapshot.machineId,
    totals: snapshot.totals,
});

const parseMachineSnapshot = (value: unknown): MachineSnapshot => {
    const parsed = MachineSnapshotFileSchema.parse(value);

    return MachineSnapshotSchema.parse({
        ...parsed,
        dailyStats: parsed.dailyStats.map((day) => ({
            composerAcceptedLines: day.composerAcceptedLines,
            composerSuggestedLines: day.composerSuggestedLines,
            date: new Date(day.date),
            tabAcceptedLines: day.tabAcceptedLines,
            tabSuggestedLines: day.tabSuggestedLines,
        })),
    });
};

export { parseMachineSnapshot, serializeMachineSnapshot };
