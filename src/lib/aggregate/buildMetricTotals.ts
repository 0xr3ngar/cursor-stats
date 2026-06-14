import { acceptanceRate } from "../metrics/acceptanceRate";
import { aiDependencyScore } from "../metrics/aiDependencyScore";

export type MetricInputs = Readonly<{
    composerAccepted: number;
    composerSuggested: number;
    tabAccepted: number;
    tabSuggested: number;
}>;

export const buildMetricTotals = (inputs: MetricInputs) => ({
    aiDependencyScore: aiDependencyScore(inputs.tabAccepted, inputs.composerAccepted),
    composer: {
        acceptanceRate: acceptanceRate(inputs.composerAccepted, inputs.composerSuggested),
        accepted: inputs.composerAccepted,
        suggested: inputs.composerSuggested,
    },
    tab: {
        acceptanceRate: acceptanceRate(inputs.tabAccepted, inputs.tabSuggested),
        accepted: inputs.tabAccepted,
        suggested: inputs.tabSuggested,
    },
});
