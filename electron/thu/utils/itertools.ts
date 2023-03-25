import { Bijection } from './bijection';

function* breakdown(array: string[]) {
    for (let i = 0; i < array.length; i += 2)
        yield [array[i], array[i + 1]] as [string, string];
}

function* iter<T>(array: T[]) {
    for (const i of array) yield i;
}

function deiter<T>(iter: Iterator<T>) {
    const result: T[] = [];
    for (let next = iter.next(); next.done; next = iter.next())
        result.push(next.value);
    return result;
}

function* repeat<T>(value: T, times: number) {
    for (let i = 0; i < times; i++) yield value;
}

function* zip<T, U>(a: Iterator<T>, b: Iterator<U>) {
    while (true) {
        const result = { a: a.next(), b: b.next() };
        const done = Object.values(result).some((iter) => iter.done);
        if (done) break;
        yield Object.values(result).map((iter) => iter.value) as [T, U];
    }
}

function groupby<T>(array: T[], key: (value: T) => string) {
    const result: { [key: string]: T[] } = {};
    let last: string | undefined = undefined;
    for (const row of array) {
        const k = key(row);
        if (last !== k) {
            result[k] = [];
            last = k;
        }
        result[k].push(row);
    }
    return result;
}

function merge<T extends string, U>(a: Iterator<T>, b: Iterator<U>) {
    return buildObject(zip(a, b));
}

function buildObject<T extends string, U>(iter: Iterable<[T, U]>) {
    const result: { [key: string]: U } = {};
    for (const [key, value] of iter) result[key.replace(/\s+/, '')] = value;
    return result;
}

function replaceKey<T>(
    obj: { [key: string]: T },
    newKeys: Bijection<string, string>
) {
    const result: { [key: string]: T } = {};
    for (const [key, value] of Object.entries(obj)) {
        if (newKeys.inA(key)) result[newKeys.get(key)!] = value;
    }
    return result;
}

function tee<T>(array: Iterable<T>, num: number): T[][] {
    const result: T[][] = [];
    let current: T[] = [];
    for (const _ of array) {
        current.push(_);
        if (current.length === num) {
            result.push(current);
            current = [];
        }
    }
    return result;
}

export {
    breakdown,
    iter,
    zip,
    merge,
    repeat,
    deiter,
    groupby,
    buildObject,
    replaceKey,
    tee
};
