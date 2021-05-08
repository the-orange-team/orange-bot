import { URL } from 'url';
import { searchGiphyById } from '../apis/giphy';
import { GIPHY_BY_NAME_ENDPOINT } from '../utils/constants';
const tag = 'handle-gifs-urls';

export async function urlParser(url: string): Promise<string> {
    const functionsMap: Record<string, Promise<string> | undefined> = {
        'https://giphy.com': giphyUrlParser(url),
    };

    const nodeURL = new URL(url);
    const parsedUrl = (await functionsMap[nodeURL.origin]) ?? url;

    return parsedUrl;
}

async function giphyUrlParser(url: string): Promise<string> {
    if (!url.includes(GIPHY_BY_NAME_ENDPOINT)) return url;

    const nodeURL = new URL(url);
    const paths = nodeURL.pathname.split('-');
    console.log(`path params ${paths}`);

    console.log('checking path params');
    const gifId = paths[paths.length - 1];
    console.log(`found ${gifId}`);
    if (!gifId) return url;

    const giphyUrl = await searchGiphyById(gifId);
    console.log(`returning ${giphyUrl}`);

    if (!gifId && !giphyUrl) return url;

    return giphyUrl;
}
