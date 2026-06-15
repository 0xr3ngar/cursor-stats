#!/usr/bin/env bun
import { createRequire } from "node:module";

import { Command } from "commander";

import { createSyncCommand } from "./commands/sync.js";

const { version } = createRequire(import.meta.url)("../package.json") as { version: string };

const program = new Command();

program
    .name("cursor-stats")
    .description("Sync Cursor tab and composer stats to a GitHub-friendly repo")
    .version(version);

program.addCommand(createSyncCommand());

await program.parseAsync(process.argv);
