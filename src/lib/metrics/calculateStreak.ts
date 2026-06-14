import type { AggregatedDailyRow } from "../aggregate/types";
import { MS_PER_DAY, ONE, ZERO } from "../util/constants";
import { sortStrings } from "../util/sortStrings";

const isPreviousCalendarDay = (currentDate: string, previousDate: string) => {
    const current = new Date(currentDate);
    const previous = new Date(previousDate);
    const dayGap = Math.round((current.getTime() - previous.getTime()) / MS_PER_DAY);

    return dayGap === ONE;
};

const activeDatesFromDaily = (daily: readonly AggregatedDailyRow[]) =>
    sortStrings(daily.filter((day) => day.totalAccepted > ZERO).map((day) => day.date));

const countTrailingStreak = (activeDates: readonly string[]) => {
    let streak = ONE;

    for (let index = activeDates.length - ONE; index > ZERO; index--) {
        const currentDate = activeDates[index];
        const previousDate = activeDates[index - ONE];

        if (!currentDate || !previousDate || !isPreviousCalendarDay(currentDate, previousDate)) {
            break;
        }

        streak++;
    }

    return streak;
};

export const calculateStreak = (daily: readonly AggregatedDailyRow[]) => {
    const activeDates = activeDatesFromDaily(daily);

    if (activeDates.length === ZERO) {
        return ZERO;
    }

    return countTrailingStreak(activeDates);
};
