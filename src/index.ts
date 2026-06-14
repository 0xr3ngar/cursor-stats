#!/usr/bin/env bun
import { createCLI } from "@bunli/core";

import syncCommand from "./commands/sync.js";

const cli = await createCLI({
    description: "Sync Cursor tab and composer stats to a GitHub-friendly repo",
    name: "cursor-stats",
    version: "0.1.0",
});

cli.command(syncCommand);

await cli.run();
