import { URL } from 'url';
import { GIPHY_BY_NAME_ENDPOINT, GIPHY_SHORTLINK_ORIGIN } from '../utils/constants';
import axios from 'axios';

export async function urlParser(url: string): Promise<string> {
    const nodeURL = new URL(url);
    const functionsMap: Record<string, Promise<string | undefined> | string | undefined> = {
        'https://giphy.com': giphyUrlParser(nodeURL),
        'http://giphy.com': giphyUrlParser(nodeURL),
        'https://gph.is': giphyShortUrlParser(nodeURL),
        'http://gph.is': giphyShortUrlParser(nodeURL),
    };
    const parsedUrl = await functionsMap[nodeURL.origin];
    if (!parsedUrl) return url;
    return parsedUrl;
}

function giphyUrlParser(nodeURL: URL): string | undefined {
    try {
        const url = nodeURL.href;
        if (!url.includes(GIPHY_BY_NAME_ENDPOINT)) return url;
        const gifId = getGiphyId(nodeURL.pathname);
        if (gifId) return `https://media.giphy.com/media/${gifId}/giphy.gif`;
    } catch (err) {
        console.error(err);
        return nodeURL.href;
    }
}

async function giphyShortUrlParser(nodeURL: URL): Promise<string | undefined> {
    try {
        const url = nodeURL.href;
        if (!url.includes(GIPHY_SHORTLINK_ORIGIN)) return url;
        const response = await axios.get(url);
        const gifId = getGiphyId(await response.request.path);
        if (gifId) return `https://media.giphy.com/media/${gifId}/giphy.gif`;
    } catch (err) {
        console.error(err);
        return nodeURL.href;
    }
}

function getGiphyId(pathParams: string) {
    const params = pathParams.split('-');
    return params[params.length - 1];
}
