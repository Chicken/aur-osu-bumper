import { logger } from "./lib/logger.js";

const requiredKeys = [
    "INSTANCE_ID",
    "DISCORD_TOKEN",
    "DISCORD_CHANNEL",
    "GIT_USER",
    "GIT_EMAIL",
    "GIT_SSH_KEY",
    "GIT_REPO",
    "PRERELEASES",
    "RELEASE_CHANNEL_NAME",
] as const;
const missing = requiredKeys.filter((key) => !process.env[key]);
if (missing.length) {
    logger.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
}

export const config = {
    instanceId: process.env.INSTANCE_ID,
    token: process.env.DISCORD_TOKEN!,
    channel: process.env.DISCORD_CHANNEL!,
    cronSchedule: process.env.CRON_SCHEDULE ?? "*/5 * * * *",
    hastebinInstance: new URL(process.env.HASTEBIN_INSTANCE ?? "https://hastebin.com/").href,
    prereleases: process.env.PRERELEASES === "true",
    releaseChannelName: process.env.RELEASE_CHANNEL_NAME,
    git: {
        user: process.env.GIT_USER!,
        email: process.env.GIT_EMAIL!,
        sshKey: process.env.GIT_SSH_KEY!,
        repo: process.env.GIT_REPO!,
    },
    debugMode: process.env.NODE_ENV === "development",
} as const;
