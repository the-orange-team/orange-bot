import { app } from '../app';
import { tweetToSlackMessage } from '../messages';
import { getLastPokeDolarTweet } from '../apis/twitter/twitter';

app.command('/pokedolar', async ({ say, ack, payload }) => {
    try {
        const { tweet, mediaUrl } = await getLastPokeDolarTweet();
        await say(tweetToSlackMessage(tweet, mediaUrl, payload.user_name));
        await ack();
    } catch (error) {
        await say('Failed to fetch last tweet.');
        app.error(error);
    }
});
