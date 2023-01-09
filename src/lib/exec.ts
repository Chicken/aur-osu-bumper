import { exec as execCB, ProcessEnvOptions } from "child_process";

/**
 * Promise wrapper for callback exec with stringified outputs and run in /osu/aur directory
 * Has utility setting for erroring on stderr
 * @param command command to run
 * @param options options to pass to child_process.exec
 * @returns
 */
export function exec(
    command: string,
    options?: ProcessEnvOptions & { errorOnStdErr?: boolean }
): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        execCB(
            command,
            {
                ...options,
                cwd: "/osu/aur",
            },
            (err: null | Error, stdout: string | Buffer, stderr: string | Buffer) => {
                if (err) return reject(err);
                if (options?.errorOnStdErr && String(stderr).trim().length) return reject(new Error(String(stderr)));
                resolve({
                    stdout: String(stdout),
                    stderr: String(stderr),
                });
            }
        );
    });
}
