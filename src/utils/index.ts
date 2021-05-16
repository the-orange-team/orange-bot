import axios from 'axios';
import { Maybe } from './types';

export const validMediaTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif'];

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

export const generateFileExtensionFromURL = async (url: string): Promise<string> => {
    if (isUrl(url)) {
        return axios
            .get(url, { responseType: 'stream' })
            .then((response) => {
                switch (response.headers['content-type']) {
                    case 'image/png':
                        return '.png';
                    case 'image/jpeg':
                        return '.jpeg';
                    case 'image/svg+xml':
                        return '.svg';
                    case 'image/gif':
                        return '.gif';
                    default:
                        return '';
                }
            })
            .catch(() => '');
    } else {
        return Promise.resolve('');
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

export * from './alias';
export * from './types';
