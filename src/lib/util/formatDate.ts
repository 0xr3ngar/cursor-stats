import { ISO_DATE_LENGTH, ZERO } from "./constants";

export const formatDate = (date: Readonly<Date>) => date.toISOString().slice(ZERO, ISO_DATE_LENGTH);
