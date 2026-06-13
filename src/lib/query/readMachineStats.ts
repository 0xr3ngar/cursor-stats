import sqlite3 from "bun:sqlite";

import { getVscdbPath } from "../util/getVscdb";
import { getAiCodeTrackingStats } from "./getAiCodeTrackingStats";

// Read state.vscdb from the Cursor global storage database
export const readMachineStats = (vscdbPath?: string) => {
    const dbPath = getVscdbPath(vscdbPath);

    const db = sqlite3.open(dbPath, { readonly: true });

    try {
        const aiCodeTrackingStats = getAiCodeTrackingStats(db);
        return aiCodeTrackingStats;
    } catch (error: unknown) {
        throw new Error(`Failed to read machine stats from ${dbPath}: ${String(error)}`, {
            cause: error,
        });
    } finally {
        db.close();
    }
};
