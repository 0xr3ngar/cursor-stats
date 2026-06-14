import { defineConfig } from "@bunli/core";

export default defineConfig({
    build: {
        compress: false,
        entry: "./src/index.ts",
        external: ["@resvg/resvg-js"],
        minify: true,
        outdir: "./dist",
        sourcemap: true,
    },
    commands: {
        directory: "./src/commands",
    },
    description: "Sync Cursor tab and composer stats to a GitHub-friendly repo",
    dev: {
        inspect: true,
        watch: true,
    },
    name: "github-cursor-stats",
    plugins: [],
    test: {
        coverage: true,
        pattern: ["**/*.test.ts", "**/*.spec.ts"],
        watch: false,
    },
    version: "0.1.0",
});
