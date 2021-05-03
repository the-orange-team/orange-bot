import { client } from './auth';

interface PokedolarReturnType {
    tweet: string;
    mediaUrl: string;
}

export function getLastPokeDolarTweet(): Promise<PokedolarReturnType> {
    const promisePokedolar = new Promise<PokedolarReturnType>((resolve, reject) => {
        const params = { screen_name: 'PokeDolar', count: 1, exclude_replies: true };
        client.get('statuses/user_timeline', params, function (error, tweets) {
            if (error) reject(error);
            const tweet: string = tweets[0]?.text;
            const mediaUrl: string = tweets[0]?.entities?.media[0]?.media_url_https;
            resolve({ tweet, mediaUrl });
            return { tweet, mediaUrl };
        });
    });
    return promisePokedolar;
}
