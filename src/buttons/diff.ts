import bent from "bent";
import type { ButtonInteraction } from "discord.js";
import { config } from "../config.js";
import { bumpVersionTo } from "../lib/versionBumper.js";

export async function run(button: ButtonInteraction, [version]: string[]): Promise<void> {
    await button.deferReply();

    try {
        const patchContent = await bumpVersionTo(version, true);
        if (!patchContent) throw new Error("No patch content!");
        const { key: hastebinKey } = await bent("POST", "json", config.hastebinInstance)("documents", patchContent);
        await button.editReply({
            content: `${button.user} Here's the patch for updating to \`${version}\`\n<${config.hastebinInstance}${hastebinKey}.patch>`,
            files: [{ name: "bump.patch", attachment: Buffer.from(patchContent, "utf8") }],
        });
    } catch (err) {
        if (err instanceof Error && err.message === "Action is locked!") {
            await button.editReply(`${button.user} Actions are locked, someone is doing something.`);
            return;
        }
        throw err;
    }
}
