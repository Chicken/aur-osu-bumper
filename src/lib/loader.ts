import type { Awaitable } from "discord.js";
import { mkdir, readdir, rm } from "node:fs/promises";
import { config } from "../config.js";
import { Button, ctx } from "../ctx.js";
import { exec } from "./exec.js";
import { logger } from "./logger.js";
import { startScheduler } from "./updateChecker.js";

async function loadEvents(files: string[]) {
    await Promise.all(
        files.map(async (file) => {
            const eventName = file.split(".")[0];
            try {
                logger.debug(`Loading event "${eventName}"`);
                const { default: event } = (await import(`../events/${file}`)) as {
                    default: null | ((...args: any[]) => Awaitable<void>);
                };
                if (!event || typeof event !== "function") throw new Error("Event doesn't export a default function.");
                ctx.client.on(eventName, event);
            } catch (err) {
                logger.error(
                    `Failed loading event "${eventName}"\n${
                        err instanceof Error ? err.stack ?? err.message : String(err)
                    }`
                );
                process.exit(1);
            }
        })
    );
}

async function loadButtons(files: string[]) {
    await Promise.all(
        files.map(async (file) => {
            const buttonName = file.split(".")[0];
            try {
                logger.debug(`Loading button "${buttonName}"`);
                const button = (await import(`../buttons/${file}`)) as Button;
                ctx.buttons.set(buttonName, button);
            } catch (err) {
                logger.error(
                    `Failed loading button "${buttonName}"\n${
                        err instanceof Error ? err.stack ?? err.message : String(err)
                    }`
                );
                process.exit(1);
            }
        })
    );
}

async function load() {
    logger.debug("Loading events and buttons...");

    const [evtFiles, btnFiles] = await Promise.all([readdir("dist/events"), readdir("dist/buttons")]);
    await Promise.all([
        loadEvents(evtFiles.filter((f) => f.endsWith(".js"))),
        loadButtons(btnFiles.filter((f) => f.endsWith(".js"))),
    ]);

    logger.success("Events and buttons loaded!");

    logger.debug("Setting up git...");

    await rm("/osu/aur", { recursive: true, force: true });
    await mkdir("/osu/aur");

    await exec(`git config --global user.name "${config.git.user}"`);
    await exec(`git config --global user.email "${config.git.email}"`);
    await exec(
        `git config --global core.sshCommand "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o LogLevel=ERROR -i ${config.git.sshKey}"`
    );
    await exec(`git clone "${config.git.repo}" .`);

    logger.success("Git initialized!");

    logger.debug("Starting update scheduler...");

    startScheduler();

    logger.success("Started update scheduler!");
}

export default load;
