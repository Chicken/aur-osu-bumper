import { readFile, writeFile } from "node:fs/promises";
import { exec } from "./exec.js";
import { logger } from "./logger.js";

let actionLock = false;

export async function bumpVersionTo(version: string, generatePatch = false): Promise<void | string> {
    if (actionLock) throw new Error("Action is locked!");
    actionLock = true;
    logger.debug(generatePatch ? "Generating a patch for" : "Bumping to", version);

    const pkgbuild = (await readFile("/osu/aur/PKGBUILD", "utf8"))
        .replace(/^pkgver=.+$/m, `pkgver=${version}`)
        .replace(/^pkgrel=.+$/m, `pkgrel=1`);
    await writeFile("/osu/aur/PKGBUILD", pkgbuild, "utf8");

    await exec("updpkgsums");
    await exec("makepkg --printsrcinfo > .SRCINFO", { errorOnStdErr: true });
    await exec("git add PKGBUILD .SRCINFO", { errorOnStdErr: true });

    await exec(`git commit -m "Bump version to ${version}"`, { errorOnStdErr: true });

    if (generatePatch) {
        const { stdout } = await exec("git --no-pager format-patch --stdout HEAD~1", { errorOnStdErr: true });
        await exec("git reset --hard HEAD~1", { errorOnStdErr: true });
        actionLock = false;
        return stdout;
    } else {
        await exec("git push -u origin master", { errorOnStdErr: true });
        actionLock = false;
    }
}
