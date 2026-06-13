import sqlite3 from "bun:sqlite";

import { getVscdbPath } from "../util/getVscdb";
import { getAiCodeTrackingStats } from "./getAiCodeTrackingStats";

// Read statevscdb from cursor database using the sqlite3 package
// ~/Library/Application Support/Cursor/User/globalStorage/state.vscdb
export const readMachineStats = (vscdbPath?: string) => {
    const dbPath = getVscdbPath(vscdbPath);

    const db = sqlite3.open(dbPath, { readonly: true });

    try {
        const aiCodeTrackingStats = getAiCodeTrackingStats(db);
        return aiCodeTrackingStats;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new TypeError(`Failed to read machine stats from ${dbPath}: ${error.message}`, {
                cause: error,
            });
        }
        throw new Error(`Failed to read machine stats from ${dbPath}: ${String(error)}`, {
            cause: error,
        });
    } finally {
        db.close();
    }
};
