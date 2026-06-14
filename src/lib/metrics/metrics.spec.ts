import { describe, expect, test } from "bun:test";

import {
    ACCEPTANCE_COMPOSER_DAY,
    ACCEPTANCE_NONE,
    ACCEPTANCE_TAB_DAY,
    AI_DEPENDENCY_MULTI_MACHINE,
    AI_DEPENDENCY_SINGLE_MACHINE,
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
    METRICS_COMPOSER_ONE_SEVENTY,
    METRICS_SUGGESTED_HUNDRED,
    METRICS_SUGGESTED_SEVEN_HUNDRED,
    METRICS_SUGGESTED_ZERO,
    METRICS_TAB_FIFTY_FIVE,
    STREAK_ACTIVITY_ONE,
    STREAK_ACTIVITY_THREE,
    STREAK_ACTIVITY_TWO,
    STREAK_SINGLE_DAY,
    STREAK_THREE_DAYS,
} from "../testing/expectations";
import { ZERO } from "../util/constants";
import { acceptanceRate } from "./acceptanceRate";
import { aiDependencyScore } from "./aiDependencyScore";
import { calculateStreak } from "./calculateStreak";
import { findBusiestDay } from "./findBusiestDay";

const TAB_THIRTY_FOUR = 34;
const COMPOSER_SIX_OH_SEVEN = 607;

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

describe("aiDependencyScore", () => {
    test("returns zero when nothing was accepted", () => {
        expect(aiDependencyScore(ZERO, ZERO)).toBe(ZERO);
    });

    test("returns composer share of accepted lines", () => {
        expect(aiDependencyScore(TAB_THIRTY_FOUR, COMPOSER_SIX_OH_SEVEN)).toBe(
            AI_DEPENDENCY_SINGLE_MACHINE,
        );
        expect(aiDependencyScore(METRICS_TAB_FIFTY_FIVE, METRICS_COMPOSER_ONE_SEVENTY)).toBe(
            AI_DEPENDENCY_MULTI_MACHINE,
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
        expect(findBusiestDay([])).toEqual({ date: "", tabAccepted: ZERO });
    });

    test("returns the day with the highest tab accepted count", () => {
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
            date: "2024-06-11",
            tabAccepted: BUSIEST_TAB_HIGH,
        });
    });
});
