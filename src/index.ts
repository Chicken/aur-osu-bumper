import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config.js";
import { ctx } from "./ctx.js";
import load from "./lib/loader.js";
import { logger } from "./lib/logger.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [] },
});

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
process.on("exit", () => {
    client.destroy();
    logger.log("Exited...");
});

try {
    ctx.client = client;
    await load();
    logger.debug("Logging in...");
    await client.login(config.token);
} catch (err) {
    logger.error(`Error during startup\n${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
    process.exit(1);
}
