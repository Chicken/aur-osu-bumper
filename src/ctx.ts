import type { ButtonInteraction, Client } from "discord.js";
import { config } from "./config.js";

export interface Button {
    run: (button: ButtonInteraction, args: string[]) => Promise<void>;
}

class Context {
    private _client: Client | null = null;
    public readonly buttons = new Map<string, Button>();

    set client(client: Client) {
        if (this._client) throw new Error("Client already initialized!");
        this._client = client;
    }

    get client(): Client {
        if (!this._client) throw new Error("Client not initialized!");
        return this._client;
    }
}

export const ctx = new Context();

// @ts-expect-error for debugging purposes
if (config.debugMode && globalThis) globalThis.ctx = ctx;
