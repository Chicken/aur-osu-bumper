import { blue, greenBright, redBright, yellow } from "colorette";
import { inspect } from "node:util";

const time = () => blue(`[${new Date().toLocaleString("en-gb")}]`);

const dataToString = (data: unknown[]) =>
    data
        .map((e) => (typeof e !== "string" ? inspect(e) : e))
        .join(" ")
        .split("\n")
        .join(`\n${" ".repeat(23)}`);

export const logger = {
    log: (...data: unknown[]) => console.log(`${time()} ${dataToString(data)}`),
    success: (...data: unknown[]) => console.log(`${time()} ${greenBright(dataToString(data))}`),
    error: (...data: unknown[]) => console.error(`${time()} ${redBright(dataToString(data))}`),
    debug: (...data: unknown[]) =>
        process.env.NODE_ENV === "development" ? console.log(`${time()} ${yellow(dataToString(data))}`) : void 0,
};
