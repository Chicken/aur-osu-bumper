import type { ButtonInteraction } from "discord.js";
import { bumpVersionTo } from "../lib/versionBumper.js";

export async function run(button: ButtonInteraction, [version]: string[]): Promise<void> {
    await button.deferReply();

    try {
        await bumpVersionTo(version);
        await Promise.all([
            button.message.edit({
                content: `~~${button.message.content}~~\n\n✅ The bump to version \`${version}\` has been accepted by ${button.user}`,
                components: [],
            }),
            button.editReply(`${button.user} Bumped to version \`${version}\`!`),
        ]);
    } catch (err) {
        if (err instanceof Error && err.message === "Action is locked!") {
            await button.editReply(`${button.user} Actions are locked, someone is doing something.`);
            return;
        }
        throw err;
    }
}
