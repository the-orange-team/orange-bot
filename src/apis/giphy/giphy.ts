import { giphyClient } from './auth';

export async function searchGiphyById(id: string): Promise<string> {
    const gifUrl = giphyClient
        .id(id)
        .then((res) => {
            return res?.data[0]?.images?.original?.url;
        })
        .catch((res) => {
            console.error(res);
            throw 'Something went wrong';
        });

    return gifUrl;
}
