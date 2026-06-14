import { PERCENT_MULTIPLIER, ZERO } from "../util/constants";
import { roundToOneDecimal } from "../util/roundToOneDecimal";

export const acceptanceRate = (accepted: number, suggested: number) => {
    if (suggested === ZERO) {
        return ZERO;
    }

    return roundToOneDecimal((accepted / suggested) * PERCENT_MULTIPLIER);
};
