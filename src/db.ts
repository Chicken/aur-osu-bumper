import Enmap from "enmap";

const foundVersions = new Enmap<string, boolean>("versions");

export function hasVersionBeenFound(version: string): boolean {
    return foundVersions.has(version);
}

export function markVersionAsFound(version: string): void {
    foundVersions.set(version, true);
}
