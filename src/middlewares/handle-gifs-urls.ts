import { URL } from 'url';
import { GIPHY_BY_NAME_ENDPOINT, GIPHY_SHORTLINK_ORIGIN } from '../utils/constants';
import axios from 'axios';
import {
    GIPHY_SHORLINK_HTTPS,
    GIPHY_SHORTLINK_HTTP,
    GIPHY_HTTP,
    GIPHY_HTTPS,
} from '../utils/constants';

export async function urlParser(url: string): Promise<string> {
    const nodeURL = new URL(url);
    const parsedUrl = (await runProviderParser(nodeURL)) ?? url;
    return parsedUrl;
}

async function runProviderParser(nodeURL: URL): Promise<string | undefined> {
    switch (nodeURL.origin) {
        case GIPHY_HTTP:
        case GIPHY_HTTPS:
            return giphyUrlParser(nodeURL);
        case GIPHY_SHORTLINK_HTTP:
        case GIPHY_SHORLINK_HTTPS:
            return await giphyShortUrlParser(nodeURL);
    }
}

function giphyUrlParser(nodeURL: URL): string | undefined {
    try {
        const url = nodeURL.href;
        if (!url.includes(GIPHY_BY_NAME_ENDPOINT)) return url;
        const gifId = getGiphyId(nodeURL.pathname);
        if (gifId) return `https://media.giphy.com/media/${gifId}/giphy.gif`;
    } catch (err) {
        console.error(err);
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
    }
}

function getGiphyId(pathParams: string) {
    const params = pathParams.split('-');
    return params[params.length - 1];
}
