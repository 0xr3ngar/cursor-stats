import { defineCommand, option } from "@bunli/core";
import { z } from "zod";

const helloCommand = defineCommand({
    description: "Say hello to someone",
    handler: async ({ flags, colors }) => {
        const greeting = `Hello, ${flags.name}`;
        const message = flags.excited ? `${greeting}!` : `${greeting}.`;

        console.log(colors.green(message));
    },
    name: "hello",
    options: {
        excited: option(z.boolean().default(false), {
            argumentKind: "flag",
            description: "Add excitement!",
            short: "e",
        }),
        name: option(z.string().default("World"), {
            description: "Name to greet",
            short: "n",
        }),
    },
});

export default helloCommand;
