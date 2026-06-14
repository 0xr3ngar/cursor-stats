export const sortByDate = <TRow extends { date: string }>(rows: readonly TRow[]) => {
    const sorted = [...rows];
    sorted.sort((left, right) => left.date.localeCompare(right.date));

    return sorted;
};
