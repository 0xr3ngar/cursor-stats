import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { defineCommand, option } from "@bunli/core";
import { z } from "zod";

import { prepareSyncOutput } from "../lib/prepareSyncOutput.js";

const JSON_INDENT = 4;

const writeSyncOutput = (outputDir: string, files: Readonly<Record<string, unknown>>) => {
    for (const [relativePath, content] of Object.entries(files)) {
        const filePath = join(outputDir, relativePath);

        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, `${JSON.stringify(content, undefined, JSON_INDENT)}\n`, "utf8");
    }
};

const syncCommand = defineCommand({
    description: "Sync Cursor stats from the local database to the output directory",
    handler: ({ cwd, flags, spinner }) => {
        const outputDir = flags.outputDir ?? cwd;
        const progress = spinner("Syncing Cursor stats...");
        progress.start();

        const output = prepareSyncOutput({
            outputDir,
            vscdbPath: flags.vscdb,
        });

        writeSyncOutput(outputDir, output.files);

        progress.succeed(`Wrote stats to ${outputDir}`);
    },
    name: "sync",
    options: {
        outputDir: option(z.string().optional(), {
            description:
                "Directory for stats.json and machines/*.json (default: current working directory)",
            short: "o",
        }),
        vscdb: option(z.string().optional(), {
            description: "Path to state.vscdb (default: platform Cursor database path)",
            short: "d",
        }),
    },
});

export default syncCommand;
