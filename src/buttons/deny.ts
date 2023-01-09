import type { ButtonInteraction } from "discord.js";

export async function run(button: ButtonInteraction, [version]: string[]): Promise<void> {
    await button.update({
        content: `~~${button.message.content}~~\n\n❌ The bump to version \`${version}\` has been vetoed by ${button.user}`,
        components: [],
    });
}
