import { ctx } from "../ctx.js";
import { logger } from "../lib/logger.js";

export default async function ready() {
    logger.success(`${ctx.client.user?.tag} succesfully online!`);
}
