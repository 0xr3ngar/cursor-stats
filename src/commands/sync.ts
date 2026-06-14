import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { defineCommand, option } from "@bunli/core";
import { z } from "zod";

import { pushToGitHub } from "../lib/git/pushToGitHub.js";
import { prepareSyncOutput } from "../lib/prepareSyncOutput.js";

const JSON_INDENT = 4;
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/u;
const color = (label: string) =>
    option(z.string().regex(HEX_COLOR, "Expected a hex color like #2DD4BF").optional(), {
        description: `${label} color as a hex value (e.g. #2DD4BF)`,
    });

const writeSyncOutput = (outputDir: string, files: Readonly<Record<string, unknown>>) => {
    for (const [relativePath, content] of Object.entries(files)) {
        const filePath = join(outputDir, relativePath);

        mkdirSync(dirname(filePath), { recursive: true });

        if (content instanceof Uint8Array) {
            writeFileSync(filePath, content);
        } else if (typeof content === "string") {
            writeFileSync(filePath, content, "utf8");
        } else {
            writeFileSync(filePath, `${JSON.stringify(content, undefined, JSON_INDENT)}\n`, "utf8");
        }
    }
};

const syncCommand = defineCommand({
    description: "Sync Cursor stats from the local database to the output directory",
    handler: async ({ cwd, flags, spinner }) => {
        const outputDir = flags.outputDir ?? cwd;
        const progress = spinner("Syncing Cursor stats...");
        progress.start();

        const output = await prepareSyncOutput({
            outputDir,
            theme: {
                accent: flags["color-accent"],
                background: flags["color-bg"],
                composer: flags["color-composer"],
                muted: flags["color-muted"],
                tab: flags["color-tab"],
                text: flags["color-text"],
            },
            visibility: {
                showComposer: flags["show-composer"],
                showTab: flags["show-tab"],
            },
            vscdbPath: flags.vscdb,
        });

        writeSyncOutput(outputDir, output.files);

        if (!flags.push) {
            progress.succeed(`Wrote stats to ${outputDir}`);
            return;
        }

        const pushed = pushToGitHub({
            dir: outputDir,
            message: "chore: update cursor stats",
            paths: Object.keys(output.files),
        });

        progress.succeed(pushed ? `Pushed stats from ${outputDir}` : "No changes to push");
    },
    name: "sync",
    options: {
        "color-accent": color("Accent (heatmap)"),
        "color-bg": color("Card background"),
        "color-composer": color("Composer metric"),
        "color-muted": color("Muted text"),
        "color-tab": color("Tab metric"),
        "color-text": color("Primary text"),
        outputDir: option(z.string().optional(), {
            description:
                "Directory for stats.json and machines/*.json (default: current working directory)",
            short: "o",
        }),
        push: option(z.boolean().default(false), {
            argumentKind: "flag",
            description: "Commit and push the generated files to the git remote",
            short: "p",
        }),
        "show-composer": option(z.boolean().default(true), {
            argumentKind: "flag",
            description: "Show the composer metric (hide with --show-composer false)",
        }),
        "show-tab": option(z.boolean().default(true), {
            argumentKind: "flag",
            description: "Show the tab metric (hide with --show-tab false)",
        }),
        vscdb: option(z.string().optional(), {
            description: "Path to state.vscdb (default: platform Cursor database path)",
            short: "d",
        }),
    },
});

export default syncCommand;
