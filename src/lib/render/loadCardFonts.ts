import { readFileSync } from "node:fs";

import type { Font } from "satori";

import geist400 from "./fonts/Geist-400.woff" with { type: "file" };
import geist600 from "./fonts/Geist-600.woff" with { type: "file" };
import geistMono600 from "./fonts/GeistMono-600.woff" with { type: "file" };
import geistMono700 from "./fonts/GeistMono-700.woff" with { type: "file" };

const read = (path: string) => readFileSync(path);

export const loadCardFonts = (): Font[] => [
    { data: read(geist400), name: "Geist", style: "normal", weight: 400 },
    { data: read(geist600), name: "Geist", style: "normal", weight: 600 },
    { data: read(geistMono600), name: "Geist Mono", style: "normal", weight: 600 },
    { data: read(geistMono700), name: "Geist Mono", style: "normal", weight: 700 },
];
