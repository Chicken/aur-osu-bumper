import { exec as execCB, ProcessEnvOptions } from "child_process";
import { logger } from "./logger.js";

/**
 * Promise wrapper for callback exec with stringified outputs and run in /osu/aur directory
 * @param command command to run
 * @param options options to pass to child_process.exec
 * @returns
 */
export function exec(command: string, options?: ProcessEnvOptions): Promise<{ stdout: string; stderr: string }> {
    logger.debug(`CMD: ${command}`);
    return new Promise((resolve, reject) => {
        execCB(
            command,
            {
                ...options,
                cwd: "/osu/aur",
            },
            (err: null | Error, stdout: string | Buffer, stderr: string | Buffer) => {
                if (err) return reject(err);
                resolve({
                    stdout: String(stdout),
                    stderr: String(stderr),
                });
            }
        );
    });
}
