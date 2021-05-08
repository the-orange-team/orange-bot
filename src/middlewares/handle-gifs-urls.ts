import { URL } from 'url';
import { searchGiphyById } from '../apis/giphy';

const tag = 'handle-gifs-urls';

export async function giphyUrlParser(url: string): Promise<string> {
    const nodeURL = new URL(url);
    const paths = nodeURL.pathname.split('/');
    console.log(`path params ${paths}`);
    let giphyUrl = url;
    console.log('checking path params');
    paths.forEach(async (path) => {
        if (
            !path.includes('giphy.gif') &&
            !path.includes('media') &&
            !path.includes('media0') &&
            path
        ) {
            const gifId = path;
            console.log(`found ${gifId}`);
            giphyUrl = await searchGiphyById(gifId);
            console.log(`returning ${giphyUrl}`);
        }
    });
    return giphyUrl;
}
