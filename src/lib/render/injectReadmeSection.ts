import { NOT_FOUND, ZERO } from "../util/constants";

const SECTION_START = "<!-- cursor-stats:start -->";
const SECTION_END = "<!-- cursor-stats:end -->";

export const injectReadmeSection = (readme: string, section: string) => {
    const block = `${SECTION_START}\n${section}\n${SECTION_END}`;
    const startIndex = readme.indexOf(SECTION_START);
    const endIndex = readme.indexOf(SECTION_END);

    if (startIndex === NOT_FOUND && endIndex === NOT_FOUND) {
        return readme.trim() === "" ? `${block}\n` : `${readme.trimEnd()}\n\n${block}\n`;
    }

    if (startIndex === NOT_FOUND || endIndex < startIndex) {
        throw new Error("README cursor-stats markers are malformed");
    }

    const before = readme.slice(ZERO, startIndex);
    const after = readme.slice(endIndex + SECTION_END.length);

    return `${before}${block}${after}`;
};
