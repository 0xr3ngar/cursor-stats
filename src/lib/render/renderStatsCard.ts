import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { buildHeatmap, type Heatmap, type HeatmapColumn } from "../metrics/buildHeatmap";
import type { AggregatedStats } from "../models/AggregatedStatsSchema";
import { loadCardFonts } from "./loadCardFonts";

interface StatsCardVisibility {
    showComposer: boolean;
    showTab: boolean;
}

interface CardTheme {
    accent: string;
    background: string;
    composer: string;
    muted: string;
    tab: string;
    text: string;
    track: string;
}

const RENDER_SCALE = 2;
const CARD_PADDING = 40;
const SECTION_GAP = 28;
const BAR_GAP = 18;

const HEATMAP_WEEKS = 53;
const HEATMAP_CELL = 11;
const HEATMAP_GAP = 3;
const HEATMAP_COL = HEATMAP_CELL + HEATMAP_GAP;
const WEEKDAY_LABEL_WIDTH = 26;
const HEATMAP_WIDTH = CARD_PADDING * 2 + WEEKDAY_LABEL_WIDTH + HEATMAP_WEEKS * HEATMAP_COL;

const LEVEL_OPACITY = [1, 0.4, 0.6, 0.8, 1] as const;
const WEEKDAY_LABELS = ["", "M", "", "W", "", "F", ""] as const;

const DEFAULT_THEME: CardTheme = {
    accent: "#2DD4BF",
    background: "#0E0E11",
    composer: "#FF7B72",
    muted: "#8B949E",
    tab: "#2DD4BF",
    text: "#E6EDF3",
    track: "#FFFFFF14",
};

const ICON_DATA_URL = `data:image/svg+xml;base64,${readFileSync(join(import.meta.dir, "assets", "cursor-ai-code-icon.svg")).toString("base64")}`;

type StyleValue = string | number;
type Style = Record<string, StyleValue>;

interface Node {
    props: {
        children?: Node | readonly Node[] | string;
        height?: number;
        src?: string;
        style: Style;
        width?: number;
    };
    type: "div" | "img";
}

const box = (style: Style, children?: Node | readonly Node[] | string): Node => ({
    props: { children, style: { display: "flex", ...style } },
    type: "div",
});

const image = (src: string, size: number): Node => ({
    props: {
        height: size,
        src,
        style: { borderRadius: 7, height: size, width: size },
        width: size,
    },
    type: "img",
});

const grouped = (value: number) => new Intl.NumberFormat("en-US").format(value);

const resolveTheme = (overrides: Readonly<Partial<CardTheme>>): CardTheme => ({
    accent: overrides.accent ?? DEFAULT_THEME.accent,
    background: overrides.background ?? DEFAULT_THEME.background,
    composer: overrides.composer ?? DEFAULT_THEME.composer,
    muted: overrides.muted ?? DEFAULT_THEME.muted,
    tab: overrides.tab ?? DEFAULT_THEME.tab,
    text: overrides.text ?? DEFAULT_THEME.text,
    track: overrides.track ?? DEFAULT_THEME.track,
});

const buildCard = (
    stats: Readonly<AggregatedStats>,
    visibility: Readonly<StatsCardVisibility>,
    theme: Readonly<CardTheme>,
) => {
    const label = (value: string, size = 12): Node =>
        box(
            {
                color: theme.muted,
                fontFamily: "Geist Mono",
                fontSize: size,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
            },
            value,
        );

    const metricBar = (
        name: string,
        accepted: number,
        suggested: number,
        rate: number,
        accent: string,
        marginTop: number,
    ): Node =>
        box({ display: "flex", flexDirection: "column", marginTop }, [
            box(
                {
                    alignItems: "flex-end",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 9,
                },
                [
                    box(
                        { color: theme.text, fontFamily: "Geist", fontSize: 17, fontWeight: 600 },
                        name,
                    ),
                    box(
                        {
                            color: theme.muted,
                            fontFamily: "Geist Mono",
                            fontSize: 13,
                            fontWeight: 600,
                        },
                        `${grouped(accepted)} / ${grouped(suggested)} · ${rate}%`,
                    ),
                ],
            ),
            box({ background: theme.track, borderRadius: 999, display: "flex", height: 8 }, [
                box({ background: accent, borderRadius: 999, height: 8, width: `${rate}%` }),
            ]),
        ]);

    const heatCell = (value: HeatmapColumn[number]): Node => {
        const base = {
            borderRadius: 2,
            height: HEATMAP_CELL,
            marginBottom: HEATMAP_GAP,
            width: HEATMAP_CELL,
        };

        if (value === undefined) {
            return box(base);
        }

        if (value.level === 0) {
            return box({ ...base, background: theme.track });
        }

        return box({ ...base, background: theme.accent, opacity: LEVEL_OPACITY[value.level] ?? 1 });
    };

    const legendSwatch = (opacity: number): Node =>
        box({
            background: theme.accent,
            borderRadius: 2,
            height: HEATMAP_CELL,
            marginLeft: 4,
            opacity,
            width: HEATMAP_CELL,
        });

    const monthLabel = (value: string | undefined): Node =>
        box(
            {
                color: theme.muted,
                fontFamily: "Geist Mono",
                fontSize: 11,
                fontWeight: 600,
                width: HEATMAP_COL,
            },
            value ?? "",
        );

    const weekdayLabel = (value: string): Node =>
        box(
            {
                alignItems: "center",
                color: theme.muted,
                fontFamily: "Geist Mono",
                fontSize: 9,
                fontWeight: 600,
                height: HEATMAP_CELL,
                marginBottom: HEATMAP_GAP,
            },
            value,
        );

    const heatmapColumn = (column: HeatmapColumn): Node =>
        box(
            { display: "flex", flexDirection: "column", marginRight: HEATMAP_GAP },
            column.map((cell) => heatCell(cell)),
        );

    const heatmap = (data: Readonly<Heatmap>): Node =>
        box({ display: "flex", flexDirection: "column", marginTop: 30 }, [
            box({ marginBottom: 14 }, label("Daily activity")),
            box({ display: "flex", marginBottom: 6 }, [
                box({ width: WEEKDAY_LABEL_WIDTH }),
                ...data.months.map((month) => monthLabel(month)),
            ]),
            box({ display: "flex" }, [
                box(
                    { display: "flex", flexDirection: "column", width: WEEKDAY_LABEL_WIDTH },
                    WEEKDAY_LABELS.map((value) => weekdayLabel(value)),
                ),
                ...data.columns.map((column) => heatmapColumn(column)),
            ]),
            box({ alignItems: "center", display: "flex", marginTop: 14 }, [
                box(
                    { color: theme.muted, fontFamily: "Geist Mono", fontSize: 11, marginRight: 4 },
                    "Fewer",
                ),
                box({
                    background: theme.track,
                    borderRadius: 2,
                    height: HEATMAP_CELL,
                    marginLeft: 4,
                    width: HEATMAP_CELL,
                }),
                legendSwatch(LEVEL_OPACITY[1]),
                legendSwatch(LEVEL_OPACITY[2]),
                legendSwatch(LEVEL_OPACITY[3]),
                legendSwatch(LEVEL_OPACITY[4]),
                box(
                    { color: theme.muted, fontFamily: "Geist Mono", fontSize: 11, marginLeft: 6 },
                    "More",
                ),
            ]),
        ]);

    const metaTile = (caption: string, value: string): Node =>
        box({ display: "flex", flexDirection: "column", marginRight: 56 }, [
            box(
                { color: theme.muted, fontFamily: "Geist", fontSize: 13, marginBottom: 8 },
                caption,
            ),
            box({ color: theme.text, fontFamily: "Geist", fontSize: 20, fontWeight: 600 }, value),
        ]);

    const divider = box({ background: theme.track, height: 1, marginBottom: 22, marginTop: 30 });

    const busiest = stats.meta.busiestDay.date === "" ? "—" : stats.meta.busiestDay.date;
    const since = stats.meta.trackingSince === "" ? "—" : stats.meta.trackingSince;

    const metaRow = box({ display: "flex" }, [
        metaTile("Most active day", busiest),
        metaTile("Streak", `${stats.meta.streak}d`),
        metaTile("Tracking since", since),
    ]);

    const children: Node[] = [
        box({ alignItems: "center", display: "flex" }, [
            image(ICON_DATA_URL, 30),
            box({ marginLeft: 13 }, label("Cursor · coding activity")),
        ]),
        heatmap(buildHeatmap(stats.daily, HEATMAP_WEEKS, new Date())),
        divider,
        metaRow,
    ];

    if (visibility.showTab) {
        children.push(
            metricBar(
                "Tab",
                stats.totals.tab.accepted,
                stats.totals.tab.suggested,
                stats.totals.tab.acceptanceRate,
                theme.tab,
                SECTION_GAP,
            ),
        );
    }

    if (visibility.showComposer) {
        children.push(
            metricBar(
                "Composer",
                stats.totals.composer.accepted,
                stats.totals.composer.suggested,
                stats.totals.composer.acceptanceRate,
                theme.composer,
                visibility.showTab ? BAR_GAP : SECTION_GAP,
            ),
        );
    }

    return box(
        {
            backgroundColor: theme.background,
            border: `1px solid ${theme.track}`,
            borderRadius: 18,
            color: theme.text,
            display: "flex",
            flexDirection: "column",
            fontFamily: "Geist",
            padding: CARD_PADDING,
            width: HEATMAP_WIDTH,
        },
        children,
    );
};

const renderStatsCard = async (
    stats: Readonly<AggregatedStats>,
    visibility: Readonly<StatsCardVisibility>,
    theme: Readonly<Partial<CardTheme>> = {},
) => {
    const svg = await satori(
        // @ts-expect-error - satori's ReactNode typing is incompatible with our plain Node tree
        buildCard(stats, visibility, resolveTheme(theme)),
        { fonts: loadCardFonts(), width: HEATMAP_WIDTH },
    );

    return new Resvg(svg, { fitTo: { mode: "zoom", value: RENDER_SCALE } }).render().asPng();
};

export { type CardTheme, type StatsCardVisibility, renderStatsCard };
