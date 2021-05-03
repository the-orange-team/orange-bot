import { app } from '../app';
import { tweetToSlackMessage } from '../messages';
import { getLastPokeDolarTweet } from '../apis/twitter/twitter';
app.message('pokedolar', async ({ say }) => {
    try {
        const { tweet, mediaUrl } = await getLastPokeDolarTweet();
        await say(tweetToSlackMessage(tweet, mediaUrl));
    } catch (error) {
        await say('Failed to fetch last tweet.');
        app.error(error);
    }
});
