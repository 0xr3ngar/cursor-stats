import { ISO_DATE_LENGTH, MS_PER_DAY, ONE, ZERO } from "../util/constants";

const DAYS_PER_WEEK = 7;

const LEVEL = { high: 3, low: 1, max: 4, medium: 2, none: 0 } as const;
const QUARTILE = { high: 0.75, low: 0.25, medium: 0.5 } as const;
const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const;

interface HeatmapCell {
    date: string;
    level: number;
    total: number;
}

type HeatmapColumn = (HeatmapCell | undefined)[];

interface Heatmap {
    columns: HeatmapColumn[];
    months: (string | undefined)[];
}

interface HeatmapDay {
    date: string;
    totalAccepted: number;
}

const utcMidnight = (date: Readonly<Date>) =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const toIsoDate = (ms: number) => new Date(ms).toISOString().slice(ZERO, ISO_DATE_LENGTH);

const levelFor = (total: number, max: number) => {
    if (total <= ZERO || max <= ZERO) {
        return LEVEL.none;
    }

    const ratio = total / max;

    if (ratio <= QUARTILE.low) {
        return LEVEL.low;
    }

    if (ratio <= QUARTILE.medium) {
        return LEVEL.medium;
    }

    if (ratio <= QUARTILE.high) {
        return LEVEL.high;
    }

    return LEVEL.max;
};

const buildHeatmap = (
    daily: readonly HeatmapDay[],
    weeks: number,
    asOf: Readonly<Date>,
): Heatmap => {
    const totals = new Map(daily.map((day) => [day.date, day.totalAccepted]));
    const max = daily.reduce((peak, day) => Math.max(peak, day.totalAccepted), ZERO);
    const today = utcMidnight(asOf);
    const todayWeekday = new Date(today).getUTCDay();
    const startSunday = today - (todayWeekday + (weeks - ONE) * DAYS_PER_WEEK) * MS_PER_DAY;

    const columns: HeatmapColumn[] = [];
    const months: (string | undefined)[] = [];
    let previousMonth = -ONE;

    for (let week = ZERO; week < weeks; week += ONE) {
        const columnStart = new Date(startSunday + week * DAYS_PER_WEEK * MS_PER_DAY);
        const month = columnStart.getUTCMonth();
        months.push(month === previousMonth ? undefined : MONTH_INITIALS[month]);
        previousMonth = month;

        const column: HeatmapColumn = [];

        for (let weekday = ZERO; weekday < DAYS_PER_WEEK; weekday += ONE) {
            const ms = startSunday + (week * DAYS_PER_WEEK + weekday) * MS_PER_DAY;

            if (ms > today) {
                column.push(undefined);
            } else {
                const date = toIsoDate(ms);
                const total = totals.get(date) ?? ZERO;

                column.push({ date, level: levelFor(total, max), total });
            }
        }

        columns.push(column);
    }

    return { columns, months };
};

export { buildHeatmap, type Heatmap, type HeatmapColumn };
