export type Maybe<T> = T | null;

export function getRandomElement<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)];
}

export const isUrl = (text: string): boolean =>
    text.startsWith('http://') || text.startsWith('https://');

/**
 * JSON parser that doesn't break when receiving null as argument
 */
export const safeJSONParser = (
    text: Maybe<string>,
    reviver: ((this: any, key: string, value: any) => any) | undefined = undefined
): any => (text ? JSON.parse(text, reviver) : null);

export const zip = <X, Y>(a: Array<X>, b: Array<Y>): Array<[X, Y]> =>
    a.map((element, index) => [element, b[index]]);
