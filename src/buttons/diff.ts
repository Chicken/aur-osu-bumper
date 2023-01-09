import type { ButtonInteraction } from "discord.js";
import { bumpVersionTo } from "../lib/versionBumper.js";

export async function run(button: ButtonInteraction, [version]: string[]): Promise<void> {
    await button.deferReply();
    const patchContent = await bumpVersionTo(version, true).catch((err) => {
        if (err instanceof Error && err.message === "Action is locked!") return null;
        else throw err;
    });
    if (!patchContent) {
        await button.editReply(`${button.user} Actions are locked, someone is doing something.`);
        return;
    }
    await button.editReply({
        content: `${button.user} Here's the patch for updating to \`${version}\``,
        files: [{ name: "bump.patch", attachment: Buffer.from(patchContent, "utf8") }],
    });
}
