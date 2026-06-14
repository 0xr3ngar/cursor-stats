import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { pushToGitHub } from "./pushToGitHub";

const git = (dir: string, args: readonly string[]) => {
    const result = Bun.spawnSync(["git", ...args], { cwd: dir });

    if (!result.success) {
        throw new Error(result.stderr.toString());
    }

    return result.stdout.toString();
};

const createClonedRepo = () => {
    const remote = mkdtempSync(join(tmpdir(), "cursor-stats-remote-"));
    git(remote, ["init", "--bare", "-b", "main"]);

    const work = mkdtempSync(join(tmpdir(), "cursor-stats-work-"));
    git(work, ["init", "-b", "main"]);
    git(work, ["config", "user.email", "test@example.com"]);
    git(work, ["config", "user.name", "Test"]);
    git(work, ["remote", "add", "origin", remote]);
    writeFileSync(join(work, "README.md"), "# Profile\n", "utf8");
    git(work, ["add", "README.md"]);
    git(work, ["commit", "-m", "init"]);
    git(work, ["push", "-u", "origin", "main"]);

    return { remote, work };
};

describe("pushToGitHub", () => {
    const dirs: string[] = [];

    afterEach(() => {
        for (const dir of dirs) {
            rmSync(dir, { force: true, recursive: true });
        }
        dirs.length = 0;
    });

    test("commits and pushes the given paths", () => {
        const { remote, work } = createClonedRepo();
        dirs.push(remote, work);

        writeFileSync(join(work, "stats.json"), "{}\n", "utf8");

        const pushed = pushToGitHub({ dir: work, message: "sync stats", paths: ["stats.json"] });

        expect(pushed).toBe(true);
        expect(git(work, ["log", "--oneline"])).toContain("sync stats");
        expect(git(work, ["rev-parse", "HEAD"]).trim()).toBe(
            git(work, ["rev-parse", "origin/main"]).trim(),
        );
    });

    test("returns false when there is nothing to commit", () => {
        const { remote, work } = createClonedRepo();
        dirs.push(remote, work);

        const pushed = pushToGitHub({ dir: work, message: "noop", paths: ["README.md"] });

        expect(pushed).toBe(false);
    });
});
