import { PERCENT_MULTIPLIER, ZERO } from "../util/constants";
import { roundToOneDecimal } from "../util/roundToOneDecimal";

export const aiDependencyScore = (tabAccepted: number, composerAccepted: number) => {
    const totalAccepted = tabAccepted + composerAccepted;

    if (totalAccepted === ZERO) {
        return ZERO;
    }

    return roundToOneDecimal((composerAccepted / totalAccepted) * PERCENT_MULTIPLIER);
};
