import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Font } from "satori";

const FONTS_DIR = join(import.meta.dir, "fonts");

const read = (file: string) => readFileSync(join(FONTS_DIR, file));

export const loadCardFonts = (): Font[] => [
    { data: read("Geist-400.woff"), name: "Geist", style: "normal", weight: 400 },
    { data: read("Geist-600.woff"), name: "Geist", style: "normal", weight: 600 },
    { data: read("GeistMono-600.woff"), name: "Geist Mono", style: "normal", weight: 600 },
    { data: read("GeistMono-700.woff"), name: "Geist Mono", style: "normal", weight: 700 },
];
