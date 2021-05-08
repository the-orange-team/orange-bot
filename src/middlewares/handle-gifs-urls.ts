import { URL } from 'url';
import { searchGiphyById } from '../apis/giphy';
import { GIPHY_BY_NAME_ENDPOINT, GIPHY_SHORTLINK_ORIGIN } from '../utils/constants';
import axios from 'axios';
const tag = 'handle-gifs-urls';

export async function urlParser(url: string): Promise<string> {
    const nodeURL = new URL(url);
    const functionsMap: Record<string, Promise<string> | string | undefined> = {
        'https://giphy.com': giphyUrlParser(nodeURL),
        'https://gph.is': giphyShortUrlParser(nodeURL),
    };
    const parsedUrl = await functionsMap[nodeURL.origin];
    console.log(nodeURL.origin);
    console.log(`giphyUrl ${parsedUrl}`);
    if (!parsedUrl) return url;
    return '';
}

function giphyUrlParser(nodeURL: URL): string {
    try {
        const url = nodeURL.href;
        console.log(url);
        if (!url.includes(GIPHY_BY_NAME_ENDPOINT)) return url;
        const pathParams = nodeURL.pathname.split('-');
        const gifId = pathParams[pathParams.length - 1];
        console.log(gifId);
        if (!gifId) return url;
        const giphyUrl = `https://media.giphy.com/media/${gifId}/giphy.gif`;
        if (!giphyUrl) return url;
        console.log(giphyUrl);
        return giphyUrl;
    } catch (err) {
        console.error(err);
        return nodeURL.href;
    }
}
async function giphyShortUrlParser(nodeURL: URL): Promise<string> {
    try {
        const url = nodeURL.href;
        console.log(`nodeURL.href ${url}`);
        if (!url.includes(GIPHY_SHORTLINK_ORIGIN)) return url;
        const config = { maxRedirects: 1 };
        const response = await axios.get(url, config);
        console.log(`response.request.path ${response.request.path}`);
        const pathParams = response.request.path.split('-');
        const gifId = pathParams[pathParams.length - 1];
        console.log(`gifId ${gifId}`);
        if (!gifId) return url;
        const giphyUrl = `https://media.giphy.com/media/${gifId}/giphy.gif`;
        console.log(`giphyUrl ${giphyUrl}`);
        if (!giphyUrl) return url;
        return giphyUrl;
    } catch (err) {
        console.error(err);
        return nodeURL.href;
    }
}
