interface PushToGitHubOptions {
    dir: string;
    message: string;
    paths: readonly string[];
}

const runGit = (dir: string, args: readonly string[]) => {
    const result = Bun.spawnSync(["git", ...args], { cwd: dir });

    if (!result.success) {
        throw new Error(`git ${args.join(" ")} failed: ${result.stderr.toString()}`);
    }

    return result.stdout.toString();
};

export const pushToGitHub = ({ dir, message, paths }: Readonly<PushToGitHubOptions>) => {
    runGit(dir, ["add", ...paths]);

    const staged = runGit(dir, ["diff", "--cached", "--name-only"]).trim();

    if (staged === "") {
        return false;
    }

    runGit(dir, ["commit", "-m", message]);
    runGit(dir, ["push"]);

    return true;
};
