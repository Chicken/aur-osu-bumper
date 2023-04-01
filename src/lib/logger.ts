import { blue, greenBright, redBright, yellow } from "colorette";
import { inspect } from "node:util";
import { config } from "../config.js";

const time = () =>
    blue(
        `[${
            new Date(Date.now() - new Date().getTimezoneOffset() * 60 * 1000)
                .toISOString()
                .replace("T", " ")
                .split(".")[0]
        }]`
    );

const dataToString = (data: unknown[], lineProcess = (line: string) => line) =>
    data
        .map((e) => (typeof e !== "string" ? inspect(e, { colors: true, depth: 4 }) : e))
        .join(" ")
        .split("\n")
        .map(lineProcess)
        .join(`\n${" ".repeat(21)}`);

export const logger = {
    log: (...data: unknown[]) => console.log(`${time()} ${dataToString(data)}`),
    success: (...data: unknown[]) => console.log(`${time()} ${dataToString(data, greenBright)}`),
    error: (...data: unknown[]) => console.error(`${time()} ${dataToString(data, redBright)}`),
    debug: (...data: unknown[]) => (config.debugMode ? console.log(`${time()} ${dataToString(data, yellow)}`) : void 0),
};

export const formatError = (err: unknown) => (err instanceof Error ? err.stack ?? err.message : String(err));
