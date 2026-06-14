import { describe, expect, test } from "bun:test";

import {
    ACCEPTANCE_COMPOSER_DAY,
    ACCEPTANCE_NONE,
    ACCEPTANCE_TAB_DAY,
    BUSIEST_COMPOSER_ONLY,
    BUSIEST_TAB_HIGH,
    BUSIEST_TAB_LOW,
    BUSIEST_TAB_MID,
    BUSIEST_TOTAL_COMPOSER,
    BUSIEST_TOTAL_HIGH,
    BUSIEST_TOTAL_LOW,
    METRICS_ACCEPTED_SIX_OH_SEVEN,
    METRICS_ACCEPTED_TEN,
    METRICS_ACCEPTED_THIRTY_FOUR,
    METRICS_SUGGESTED_HUNDRED,
    METRICS_SUGGESTED_SEVEN_HUNDRED,
    METRICS_SUGGESTED_ZERO,
    STREAK_ACTIVITY_ONE,
    STREAK_ACTIVITY_THREE,
    STREAK_ACTIVITY_TWO,
    STREAK_SINGLE_DAY,
    STREAK_THREE_DAYS,
} from "../testing/expectations";
import { ZERO } from "../util/constants";
import { acceptanceRate } from "./acceptanceRate";
import { calculateStreak } from "./calculateStreak";
import { findBusiestDay } from "./findBusiestDay";

describe("acceptanceRate", () => {
    test("returns zero when nothing was suggested", () => {
        expect(acceptanceRate(METRICS_ACCEPTED_TEN, METRICS_SUGGESTED_ZERO)).toBe(ACCEPTANCE_NONE);
    });

    test("returns accepted divided by suggested as a percentage", () => {
        expect(acceptanceRate(METRICS_ACCEPTED_THIRTY_FOUR, METRICS_SUGGESTED_HUNDRED)).toBe(
            ACCEPTANCE_TAB_DAY,
        );
        expect(acceptanceRate(METRICS_ACCEPTED_SIX_OH_SEVEN, METRICS_SUGGESTED_SEVEN_HUNDRED)).toBe(
            ACCEPTANCE_COMPOSER_DAY,
        );
    });
});

describe("calculateStreak", () => {
    test("returns zero when there is no activity", () => {
        expect(calculateStreak([])).toBe(ZERO);
    });

    test("counts consecutive active days ending on the most recent date", () => {
        expect(
            calculateStreak([
                {
                    composerAccepted: ZERO,
                    date: "2024-06-10",
                    tabAccepted: STREAK_ACTIVITY_ONE,
                    totalAccepted: STREAK_ACTIVITY_ONE,
                },
                {
                    composerAccepted: ZERO,
                    date: "2024-06-11",
                    tabAccepted: STREAK_ACTIVITY_TWO,
                    totalAccepted: STREAK_ACTIVITY_TWO,
                },
                {
                    composerAccepted: ZERO,
                    date: "2024-06-13",
                    tabAccepted: STREAK_ACTIVITY_THREE,
                    totalAccepted: STREAK_ACTIVITY_THREE,
                },
            ]),
        ).toBe(STREAK_SINGLE_DAY);
    });

    test("counts a multi-day streak when dates are consecutive", () => {
        expect(
            calculateStreak([
                {
                    composerAccepted: ZERO,
                    date: "2024-06-10",
                    tabAccepted: STREAK_ACTIVITY_ONE,
                    totalAccepted: STREAK_ACTIVITY_ONE,
                },
                {
                    composerAccepted: ZERO,
                    date: "2024-06-11",
                    tabAccepted: STREAK_ACTIVITY_TWO,
                    totalAccepted: STREAK_ACTIVITY_TWO,
                },
                {
                    composerAccepted: ZERO,
                    date: "2024-06-12",
                    tabAccepted: STREAK_ACTIVITY_THREE,
                    totalAccepted: STREAK_ACTIVITY_THREE,
                },
            ]),
        ).toBe(STREAK_THREE_DAYS);
    });
});

describe("findBusiestDay", () => {
    test("returns an empty result when there is no daily data", () => {
        expect(findBusiestDay([])).toEqual({ date: "", totalAccepted: ZERO });
    });

    test("returns the day with the highest total accepted count", () => {
        expect(
            findBusiestDay([
                {
                    composerAccepted: ZERO,
                    date: "2024-06-10",
                    tabAccepted: BUSIEST_TAB_LOW,
                    totalAccepted: BUSIEST_TOTAL_LOW,
                },
                {
                    composerAccepted: ZERO,
                    date: "2024-06-11",
                    tabAccepted: BUSIEST_TAB_HIGH,
                    totalAccepted: BUSIEST_TOTAL_HIGH,
                },
                {
                    composerAccepted: BUSIEST_COMPOSER_ONLY,
                    date: "2024-06-12",
                    tabAccepted: BUSIEST_TAB_MID,
                    totalAccepted: BUSIEST_TOTAL_COMPOSER,
                },
            ]),
        ).toEqual({
            date: "2024-06-12",
            totalAccepted: BUSIEST_TOTAL_COMPOSER,
        });
    });
});
