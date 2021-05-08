import { URL } from 'url';
import { searchGiphyById } from '../apis/giphy';
import { GIF_DOMAIN } from '../utils/constants';
const tag = 'handle-gifs-urls';

export async function giphyUrlParser(url: string): Promise<string> {
    if (!url.includes(GIF_DOMAIN)) return url;

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
