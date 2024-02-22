export default function pick<T extends object, K extends keyof T>(obj: T, ...keys: (K | (K | K[])[])[]): Pick<T, K> {
    const keysToKeep = keys.flat(2) as (keyof T)[]

    const entries = keysToKeep.map(key => ([key, obj[key]]));
    return Object.fromEntries(entries);
}
