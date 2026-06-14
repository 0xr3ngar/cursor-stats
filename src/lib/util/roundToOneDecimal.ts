import { ONE_DECIMAL_PLACE } from "./constants";

export const roundToOneDecimal = (value: number) =>
    Math.round(value * ONE_DECIMAL_PLACE) / ONE_DECIMAL_PLACE;
