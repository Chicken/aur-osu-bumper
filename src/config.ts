import { logger } from "./lib/logger.js";

const requiredKeys = [
    "DISCORD_TOKEN",
    "DISCORD_CHANNEL",
    "CRON_SCHEDULE",
    "GIT_USER",
    "GIT_EMAIL",
    "GIT_SSH_KEY",
] as const;
const missing = requiredKeys.filter((key) => !process.env[key]);
if (missing.length) {
    logger.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
}

export const config = {
    token: process.env.DISCORD_TOKEN!,
    channel: process.env.DISCORD_CHANNEL!,
    cronSchedule: process.env.CRON_SCHEDULE!,
    git: {
        user: process.env.GIT_USER!,
        email: process.env.GIT_EMAIL!,
        sshKey: process.env.GIT_SSH_KEY!,
    },
} as const;
