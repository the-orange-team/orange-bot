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
    try {
        if (!url.includes(GIPHY_BY_NAME_ENDPOINT)) return url;
        const nodeURL = new URL(url);
        const paths = nodeURL.pathname.split('-');
        const gifId = paths[paths.length - 1];
        if (!gifId) return url;
        const giphyUrl = await searchGiphyById(gifId);
        if (!giphyUrl) return url;
        return giphyUrl;
    } catch (err) {
        console.error(err);
        return url;
    }
}
