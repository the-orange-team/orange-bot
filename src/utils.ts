export function getRandomElement<T>(array: Array<T>): T{
    return array[Math.floor(Math.random() * array.length)];
}

export const isUrl = (text: string) : boolean => text.startsWith('http://') || text.startsWith('https://');