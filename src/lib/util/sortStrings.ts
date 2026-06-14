export const sortStrings = (values: readonly string[]) => {
    const sorted = [...values];
    sorted.sort();

    return sorted;
};
