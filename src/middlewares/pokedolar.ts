import Twitter from 'twitter';
import { app } from '../app';
import { textToSlackMessage } from '../messages/slack-adapter';

app.message('pokedolar', async ({ say }) => {
    const client = new Twitter({
        consumer_key: process.env.TWITTER_API_KEY ?? '',
        consumer_secret: process.env.TWITTER_API_SECRET_KEY ?? '',
        bearer_token: process.env.TWITTER_BEARER_TOKEN ?? '',
    });

    const params = { screen_name: 'PokeDolar', count: 1, exclude_replies: true };

    client.get('statuses/user_timeline', params, async function (error, tweets) {
        if (!error) {
            try {
                const URL = tweets[0]?.entities?.media[0]?.url;
                await say(textToSlackMessage('pokedolar', URL));
            } catch (error) {
                await say('Failed to fetch last tweet.');
                app.error(error);
            }
        }
    });
});
