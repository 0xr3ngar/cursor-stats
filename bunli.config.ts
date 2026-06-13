import { defineConfig } from "@bunli/core";

export default defineConfig({
    build: {
        compress: false,
        entry: "./src/index.ts",
        minify: true,
        outdir: "./dist",
        sourcemap: true,
        targets: ["native"],
    },
    commands: {
        directory: "./src/commands",
    },
    description: "A CLI built with Bunli",
    dev: {
        inspect: true,
        watch: true,
    },
    name: "cursor-stats",
    plugins: [],
    test: {
        coverage: true,
        pattern: ["**/*.test.ts", "**/*.spec.ts"],
        watch: false,
    },
    version: "0.1.0",
});
