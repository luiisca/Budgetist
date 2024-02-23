export default function omit<T extends object, K extends keyof T>(obj: T, ...keys: (K | (K | K[])[])[]): {
    [K2 in Exclude<keyof T, K>]: T[K2]
} {
    const keysToRemove = keys.flat(2) as (keyof T)[];

    let ret = {} as {
        [K in keyof typeof obj]: (typeof obj)[K]
    };

    let key: keyof typeof obj;
    for (key in obj) {
        if (!(keysToRemove.includes(key))) {
            ret[key] = obj[key];
        }
    }

    return ret;
}