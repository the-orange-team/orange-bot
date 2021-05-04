import { app } from '../app';
import { callAuthorized } from './user-auth';
import { tweetToSlackMessage } from '../messages';
import { getLastPokeDolarTweet } from '../apis/twitter/twitter';

app.command('/pokedolar', callAuthorized, async ({ say, ack, payload, logger }) => {
    try {
        logger.info(`[pokedolar] fetching last tweet`);
        const { tweet, mediaUrl } = await getLastPokeDolarTweet();
        await say(tweetToSlackMessage(tweet, mediaUrl, payload.user_name));
        await ack();
    } catch (error) {
        logger.error(error);
        await say('Failed to fetch last tweet.');
    }
});
