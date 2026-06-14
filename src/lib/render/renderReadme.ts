const CARD_IMAGE_NAME = "cursor-stats.png";

const CARD_DISPLAY_WIDTH = 640;

const renderReadme = () =>
    [
        "",
        `<img src="${CARD_IMAGE_NAME}" alt="Cursor coding activity" width="${CARD_DISPLAY_WIDTH}" />`,
        "",
    ].join("\n");

export { renderReadme, CARD_IMAGE_NAME };
