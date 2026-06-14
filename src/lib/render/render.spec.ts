import { describe, expect, test } from "bun:test";

import { aggregateSnapshots } from "../aggregate/aggregateSnapshots";
import { dailyStat, machineSnapshot } from "../testing/fixtures";
import { injectReadmeSection } from "./injectReadmeSection";
import { renderReadme } from "./renderReadme";
import { renderStatsCard } from "./renderStatsCard";

const SAMPLE_TAB = 34;
const SAMPLE_COMPOSER = 607;
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

const sampleStats = () =>
    aggregateSnapshots([
        machineSnapshot("dev-mac-darwin-arm64", [
            dailyStat("2024-06-14", {
                composerAcceptedLines: SAMPLE_COMPOSER,
                tabAcceptedLines: SAMPLE_TAB,
            }),
        ]),
    ]);

describe("renderReadme", () => {
    test("embeds the stats card image and an updated caption", () => {
        const section = renderReadme();

        expect(section).toContain('<img src="cursor-stats.png"');
    });
});

describe("renderStatsCard", () => {
    test("renders a PNG image", async () => {
        const png = await renderStatsCard(sampleStats(), {
            showComposer: true,
            showTab: true,
        });

        expect(png).toBeInstanceOf(Uint8Array);
        expect([...png.subarray(0, PNG_MAGIC.length)]).toEqual(PNG_MAGIC);
    });
});

describe("injectReadmeSection", () => {
    test("appends a marked block when the readme has no markers", () => {
        const result = injectReadmeSection("# Profile\n\nHello", "STATS");

        expect(result).toBe(
            "# Profile\n\nHello\n\n<!-- cursor-stats:start -->\nSTATS\n<!-- cursor-stats:end -->\n",
        );
    });

    test("returns only the block for an empty readme", () => {
        const result = injectReadmeSection("", "STATS");

        expect(result).toBe("<!-- cursor-stats:start -->\nSTATS\n<!-- cursor-stats:end -->\n");
    });

    test("replaces existing content between markers and preserves the rest", () => {
        const readme =
            "# Profile\n<!-- cursor-stats:start -->\nOLD\n<!-- cursor-stats:end -->\nFooter";

        const result = injectReadmeSection(readme, "NEW");

        expect(result).toBe(
            "# Profile\n<!-- cursor-stats:start -->\nNEW\n<!-- cursor-stats:end -->\nFooter",
        );
    });

    test("throws when markers are malformed", () => {
        expect(() => injectReadmeSection("<!-- cursor-stats:start -->\nonly start", "NEW")).toThrow(
            "malformed",
        );
    });
});
