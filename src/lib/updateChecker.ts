import bent from "bent";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { schedule } from "node-cron";
import { readFile } from "node:fs/promises";
import { config } from "../config.js";
import { ctx } from "../ctx.js";
import { hasVersionBeenFound, markVersionAsFound } from "../db.js";
import { exec } from "./exec.js";
import { logger } from "./logger.js";

/**
 * Compare calver versions such as 2022.1228.0 (YYYY.MM0D.MICRO)
 * Is version A newer than version B?
 * @param a possible candidate
 * @param b known version
 */
function isNewer(a: string, b: string): boolean {
    const [aYear, aDate, aPatch] = a.split(".").map(Number);
    const [bYear, bDate, bPatch] = b.split(".").map(Number);
    if (aYear == null || aDate == null || aPatch == null || bYear == null || bDate == null || bPatch == null)
        throw new Error("Invalid version");
    if (aYear > bYear) return true;
    if (aYear < bYear) return false;
    if (aDate > bDate) return true;
    if (aDate < bDate) return false;
    if (aPatch > bPatch) return true;
    return false;
}

async function getLatestVersion(prereleases: boolean): Promise<string> {
    let res = (await bent("GET", "json")("https://api.github.com/repos/ppy/osu/releases", undefined, {
        "User-Agent": "aur-osu-bumper",
    })) as { name: string; prerelease: boolean }[];
    res = res.filter((r) => prereleases || !r.prerelease);
    if (!res[0]?.name || !/^\d{4}\.\d{3,4}\.\d*$/.test(res[0].name)) throw new Error("No release found!");
    return res[0].name;
}

async function getOldVersion(): Promise<string> {
    const pkgbuild = await readFile("/osu/aur/PKGBUILD", "utf8");
    const version = pkgbuild.match(/^pkgver=(.+)$/m)?.[1];
    if (!version) throw new Error("Failed to parse PKGBUILD");
    return version;
}

async function checkForUpdates(): Promise<void> {
    try {
        await exec("git pull");
        const newVersion = await getLatestVersion(config.prereleases);
        const oldVersion = await getOldVersion();
        logger.debug(
            `Versions, old: ${oldVersion}, new: ${newVersion}, newer: ${isNewer(
                newVersion,
                oldVersion
            )}, found: ${hasVersionBeenFound(newVersion)}`
        );
        if (newVersion === oldVersion || hasVersionBeenFound(newVersion) || !isNewer(newVersion, oldVersion)) return;
        markVersionAsFound(newVersion);

        const ch = await ctx.client.channels.fetch(config.channel).catch(() => null);
        if (!ch || !ch.isSendable()) throw new Error("Channel not found");

        const diffButton = new ButtonBuilder()
            .setCustomId(`${config.instanceId}-diff-${newVersion}`)
            .setEmoji("❔")
            .setStyle(ButtonStyle.Primary);
        const acceptButton = new ButtonBuilder()
            .setCustomId(`${config.instanceId}-accept-${newVersion}`)
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success);
        const denyButton = new ButtonBuilder()
            .setCustomId(`${config.instanceId}-deny-${newVersion}`)
            .setEmoji("❌")
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(diffButton, acceptButton, denyButton);

        await ch.send({
            content: `
            I found a new update for **${config.releaseChannelName}**!!! \\\\(^ヮ^)/
            We're going from \`${oldVersion}\` to \`${newVersion}\`!! Exciting!!! o(>ω<)o
            Will you guys please check if I didn't make a fucky wucky? (⌒\\_⌒;)
            Check the changelog here <https://github.com/ppy/osu/releases/tag/${newVersion}> ૮ ˶ᵔ ᵕ ᵔ˶ ა
            Or wait for the lazer updates youtube video o(≧▽≦)o

            *Press the ❔ button to view a diff of changes.*
            *Press the ✅ button to approve the changes!*
            *To deny the changes press the ❌ button* (forgive me for being dumb 人(\\_ \\_\\*)
            `
                .split("\n")
                .map((l) => l.trim())
                .slice(1, -1)
                .join("\n"),
            components: [row],
        });
    } catch (err) {
        logger.error(`Update checker failed\n${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
    }
}

export function startScheduler() {
    schedule(config.cronSchedule, checkForUpdates);
}
