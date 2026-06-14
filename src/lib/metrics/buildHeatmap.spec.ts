import { describe, expect, test } from "bun:test";

import { buildHeatmap } from "./buildHeatmap";

const WEEKS = 6;
const GRID_DAYS = 42;

describe("buildHeatmap", () => {
    test("lays out the requested number of week columns", () => {
        const { columns, months } = buildHeatmap([], WEEKS, new Date("2026-06-10T12:00:00Z"));

        expect(columns).toHaveLength(WEEKS);
        expect(months).toHaveLength(WEEKS);
        expect(columns.flat()).toHaveLength(GRID_DAYS);
    });

    test("marks the busiest day at the maximum level and quieter days lower", () => {
        const asOf = new Date("2026-06-13T00:00:00Z");
        const { columns } = buildHeatmap(
            [
                { date: "2026-05-18", totalAccepted: 1000 },
                { date: "2026-05-19", totalAccepted: 100 },
            ],
            WEEKS,
            asOf,
        );

        const cells = columns.flat();
        const busy = cells.find((cell) => cell?.date === "2026-05-18");
        const quiet = cells.find((cell) => cell?.date === "2026-05-19");
        const idle = cells.find((cell) => cell?.date === "2026-05-20");

        expect(busy?.level).toBe(4);
        expect(quiet?.level).toBe(1);
        expect(idle?.level).toBe(0);
    });

    test("labels a column when its month changes", () => {
        const { months } = buildHeatmap([], WEEKS, new Date("2026-06-13T00:00:00Z"));

        expect(months.filter((month) => month !== undefined).length).toBeGreaterThan(0);
    });

    test("leaves days after asOf empty", () => {
        const asOf = new Date("2026-06-10T00:00:00Z");
        const { columns } = buildHeatmap([], WEEKS, asOf);

        expect(columns.flat().filter((cell) => cell === undefined).length).toBeGreaterThan(0);
    });
});
