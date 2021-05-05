import { app } from '../app';
import { callAuthorized } from './user-auth';
import { tweetToSlackMessage } from '../messages';
import { getLastPokeDolarTweet } from '../apis/twitter/twitter';
import { orangeLogger } from '../logger';

const tag = 'pokedolar';

app.command('/pokedolar', callAuthorized, async ({ say, ack, payload, logger }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        const { tweet, mediaUrl } = await getLastPokeDolarTweet();
        orangeLogger.logStep(logger, tag, 'fetched', payload);
        await say(tweetToSlackMessage(tweet, mediaUrl, payload.user_name));
        await ack();
    } catch (error) {
        await say('Failed to fetch last tweet.');
        orangeLogger.logError(error, payload);
    }
});
