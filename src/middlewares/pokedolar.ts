import { client } from '../apis/twitter';
import { app } from '../app';
import { tweetToSlackMessage } from '../messages';

app.message('pokedolar', async ({ say }) => {
    const params = { screen_name: 'PokeDolar', count: 1, exclude_replies: true };

    client.get('statuses/user_timeline', params, async function (error, tweets) {
        try {
            if (!error) {
                const tweet = tweets[0]?.text;
                const mediaUrl = tweets[0]?.entities?.media[0]?.media_url_https;
                await say(tweetToSlackMessage(tweet, mediaUrl));
            }
        } catch (error) {
            await say('Failed to fetch last tweet.');
            app.error(error);
        }
    });
});
