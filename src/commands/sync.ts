import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import chalk from "chalk";
import { Command, Option } from "commander";
import ora from "ora";
import { z } from "zod";

import { pushToGitHub } from "../lib/git/pushToGitHub.js";
import { prepareSyncOutput } from "../lib/prepareSyncOutput.js";

const JSON_INDENT = 4;
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/u;

const hexColor = (label: string) =>
    z
        .string()
        .regex(HEX_COLOR, "Expected a hex color like #2DD4BF")
        .optional()
        .describe(`${label} color as a hex value (e.g. #2DD4BF)`);

const parseBoolean = (value: string): boolean => {
    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    throw new Error(`Expected "true" or "false", got "${value}"`);
};

const syncFlagsSchema = z.object({
    colorAccent: hexColor("Accent (heatmap)"),
    colorBg: hexColor("Card background"),
    colorComposer: hexColor("Composer metric"),
    colorMuted: hexColor("Muted text"),
    colorTab: hexColor("Tab metric"),
    colorText: hexColor("Primary text"),
    outputDir: z
        .string()
        .optional()
        .describe(
            "Directory for stats.json and machines/*.json (default: current working directory)",
        ),
    push: z
        .boolean()
        .default(false)
        .describe("Commit and push the generated files to the git remote"),
    showComposer: z
        .boolean()
        .default(true)
        .describe("Show the composer metric (hide with --show-composer false)"),
    showTab: z.boolean().default(true).describe("Show the tab metric (hide with --show-tab false)"),
    vscdb: z
        .string()
        .optional()
        .describe("Path to state.vscdb (default: platform Cursor database path)"),
});

interface SyncCommandOptions {
    readonly colorAccent?: string;
    readonly colorBg?: string;
    readonly colorComposer?: string;
    readonly colorMuted?: string;
    readonly colorTab?: string;
    readonly colorText?: string;
    readonly outputDir?: string;
    readonly push?: boolean;
    readonly showComposer?: boolean;
    readonly showTab?: boolean;
    readonly vscdb?: string;
}

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

const runSync = async (flags: z.infer<typeof syncFlagsSchema>) => {
    const outputDir = flags.outputDir ?? process.cwd();
    const spinner = ora("Syncing Cursor stats...").start();

    const output = await prepareSyncOutput({
        outputDir,
        theme: {
            accent: flags.colorAccent,
            background: flags.colorBg,
            composer: flags.colorComposer,
            muted: flags.colorMuted,
            tab: flags.colorTab,
            text: flags.colorText,
        },
        visibility: {
            showComposer: flags.showComposer,
            showTab: flags.showTab,
        },
        vscdbPath: flags.vscdb,
    });

    writeSyncOutput(outputDir, output.files);

    if (!flags.push) {
        spinner.succeed(chalk.green(`Wrote stats to ${outputDir}`));
        return;
    }

    const pushed = pushToGitHub({
        deletionDirs: ["machines"],
        dir: outputDir,
        message: "chore: update cursor stats",
        paths: Object.keys(output.files),
    });

    spinner.succeed(chalk.green(pushed ? `Pushed stats from ${outputDir}` : "No changes to push"));
};

export const createSyncCommand = () => {
    const command = new Command("sync")
        .description("Sync Cursor stats from the local database to the output directory")
        .option(
            "-o, --output-dir <dir>",
            "Directory for stats.json and machines/*.json (default: current working directory)",
        )
        .option("-p, --push", "Commit and push the generated files to the git remote")
        .addOption(
            new Option(
                "--show-composer <boolean>",
                "Show the composer metric (hide with --show-composer false)",
            )
                .default(true)
                .argParser(parseBoolean),
        )
        .addOption(
            new Option("--show-tab <boolean>", "Show the tab metric (hide with --show-tab false)")
                .default(true)
                .argParser(parseBoolean),
        )
        .option(
            "-d, --vscdb <path>",
            "Path to state.vscdb (default: platform Cursor database path)",
        )
        .option("--color-accent <hex>", "Accent (heatmap) color as a hex value (e.g. #2DD4BF)")
        .option("--color-bg <hex>", "Card background color as a hex value (e.g. #2DD4BF)")
        .option("--color-composer <hex>", "Composer metric color as a hex value (e.g. #2DD4BF)")
        .option("--color-muted <hex>", "Muted text color as a hex value (e.g. #2DD4BF)")
        .option("--color-tab <hex>", "Tab metric color as a hex value (e.g. #2DD4BF)")
        .option("--color-text <hex>", "Primary text color as a hex value (e.g. #2DD4BF)")
        .action(async (options: SyncCommandOptions) => {
            const flags = syncFlagsSchema.parse({
                colorAccent: options.colorAccent,
                colorBg: options.colorBg,
                colorComposer: options.colorComposer,
                colorMuted: options.colorMuted,
                colorTab: options.colorTab,
                colorText: options.colorText,
                outputDir: options.outputDir,
                push: options.push ?? false,
                showComposer: options.showComposer,
                showTab: options.showTab,
                vscdb: options.vscdb,
            });

            await runSync(flags);
        });

    return command;
};
