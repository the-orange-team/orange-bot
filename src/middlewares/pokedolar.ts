import Twitter from 'twitter';
import { app } from '../app';

app.message('pokedolar', async () => {
    const client = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY ?? '',
        consumer_secret: process.env.TWITTER_API_SECRET_KEY ?? '',
        bearer_token: process.env.TWITTER_BEARER_TOKEN ?? '',
    });

    const params = { screen_name: 'PokeDolar', count: 1 };

    client.get('statuses/user_timeline', params, function (error, tweets) {
        if (!error) {
            console.log(tweets);
        }
    });
});