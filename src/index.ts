#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Command } from "commander";
import { z } from "zod";

import { createSyncCommand } from "./commands/sync.js";

const packageJson = z
    .object({ version: z.string() })
    .parse(JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8")));

const program = new Command();

program
    .name("cursor-stats")
    .description("Sync Cursor tab and composer stats to a GitHub-friendly repo")
    .version(packageJson.version);

program.addCommand(createSyncCommand());

await program.parseAsync(process.argv);
