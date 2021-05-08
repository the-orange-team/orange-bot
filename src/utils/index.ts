import axios from 'axios';

export const validMediaTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif'];

export type Maybe<T> = T | null;

export function getRandomElement<T>(array: Array<T>): T {
    return array[Math.floor(Math.random() * array.length)];
}

export const isUrl = (text: string): boolean =>
    text.startsWith('http://') || text.startsWith('https://');

export const isMediaUrl = async (url: string): Promise<boolean> => {
    if (isUrl(url)) {
        return axios
            .get(url, { responseType: 'stream' })
            .then((response) => {
                return validMediaTypes.includes(response.headers['content-type']);
            })
            .catch(() => false);
    } else {
        return Promise.resolve(false);
    }
};

/**
 * JSON parser that doesn't break when receiving null as argument
 */
export const safeJSONParser = (
    text: Maybe<string>,
    reviver: ((this: any, key: string, value: any) => any) | undefined = undefined
): any => (text ? JSON.parse(text, reviver) : null);

export const zip = <X, Y>(a: Array<X>, b: Array<Y>): Array<[X, Y]> =>
    a.map((element, index) => [element, b[index]]);

export const groupArrayByKey = <T, K extends string>(
    array: T[],
    keyOf: (item: T) => K
): Record<K, T[]> =>
    array.reduce((grouped, item) => {
        const key = keyOf(item);
        (grouped[key] = grouped[key] || []).push(item);
        return grouped;
    }, {} as Record<K, T[]>);

export const removeStringExtraSpaces = (value: string): string => {
    return value.replace(/\s+/g, ' ').trim();
};
