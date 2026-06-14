import { acceptanceRate } from "../metrics/acceptanceRate";

export type MetricInputs = Readonly<{
    composerAccepted: number;
    composerSuggested: number;
    tabAccepted: number;
    tabSuggested: number;
}>;

export const buildMetricTotals = (inputs: MetricInputs) => ({
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
