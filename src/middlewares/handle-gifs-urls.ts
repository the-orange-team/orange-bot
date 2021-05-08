import { URL } from 'url';
import { searchGiphyById } from '../apis/giphy';
import { GIPHY_BY_NAME_ENDPOINT, GIPHY_SHORTLINK_ORIGIN } from '../utils/constants';
import axios from 'axios';
const tag = 'handle-gifs-urls';

export async function urlParser(url: string): Promise<string> {
    const nodeURL = new URL(url);
    const functionsMap: Record<string, Promise<string> | undefined> = {
        'https://giphy.com': giphyUrlParser(nodeURL),
        'https://gph.is/': giphyShortUrlParser(nodeURL),
    };
    const parsedUrl = (await functionsMap[nodeURL.origin]) ?? url;
    return parsedUrl;
}

async function giphyUrlParser(nodeURL: URL): Promise<string> {
    try {
        const url = nodeURL.href;
        if (!url.includes(GIPHY_BY_NAME_ENDPOINT)) return url;
        const pathParams = nodeURL.pathname.split('-');
        const gifId = pathParams[pathParams.length - 1];
        if (!gifId) return url;
        const giphyUrl = await searchGiphyById(gifId);
        if (!giphyUrl) return url;
        return giphyUrl;
    } catch (err) {
        console.error(err);
        return nodeURL.href;
    }
}

async function giphyShortUrlParser(nodeURL: URL): Promise<string> {
    const url = nodeURL.href;
    const config = {
        maxRedirects: 1,
    };
    if (!url.includes(GIPHY_SHORTLINK_ORIGIN)) return url;
    const response = await axios.get(url, config);
    console.log(response.request.path);

    return '';
}
