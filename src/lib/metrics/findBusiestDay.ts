import type { AggregatedDailyRow } from "../aggregate/types";
import { ZERO } from "../util/constants";

const emptyBusiestDay = () => ({ date: "", tabAccepted: ZERO });

export const findBusiestDay = (daily: readonly AggregatedDailyRow[]) => {
    if (daily.length === ZERO) {
        return emptyBusiestDay();
    }

    const [firstDay, ...remainingDays] = daily;
    let busiest = firstDay;

    for (const day of remainingDays) {
        if (day.tabAccepted > busiest.tabAccepted) {
            busiest = day;
        }
    }

    return { date: busiest.date, tabAccepted: busiest.tabAccepted };
};
