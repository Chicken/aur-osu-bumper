import type { Interaction } from "discord.js";
import { ctx } from "../ctx.js";
import { logger } from "../lib/logger.js";

export default async (interaction: Interaction) => {
    if (interaction.isButton()) {
        try {
            const [btn, ...args] = interaction.customId.split("-");
            const button = ctx.buttons.get(btn);
            if (!button) {
                await interaction.reply({
                    content: "For some reason this button was left unhandled.",
                    ephemeral: true,
                });
                return;
            }
            await button.run(interaction, args);
        } catch (err) {
            try {
                await interaction[interaction.replied || interaction.deferred ? "editReply" : "reply"]({
                    content: "Something went wrong while executing that button...\n*The updater will now restart...*",
                    ephemeral: true,
                });
            } catch {
                // ignore
            } finally {
                logger.error(
                    `Error while handling a button\n${err instanceof Error ? err.stack ?? err.message : String(err)}`
                );
                process.exit(1);
            }
        }
    }
};
