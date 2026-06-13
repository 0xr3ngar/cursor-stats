#!/usr/bin/env bun
import { createCLI } from "@bunli/core";

import helloCommand from "./commands/hello.js";

const cli = await createCLI({
    description: "A CLI built with Bunli",
    name: "cursor-stats",
    version: "0.1.0",
});

cli.command(helloCommand);

await cli.run();
