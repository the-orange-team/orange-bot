import { app } from '../app';
import { callAuthorized } from './user-auth';
import { tweetToSlackMessage } from '../messages';
import { getLastPokeDolarTweet } from '../apis/twitter/twitter';
import { orangeLogger } from '../logger';

const tag = 'pokedolar';

app.command('/pokedolar', callAuthorized, async ({ say, ack, context, logger, payload }) => {
    try {
        context.logStep(logger, tag, 'received');
        const { tweet, mediaUrl } = await getLastPokeDolarTweet();
        context.logStep(logger, tag, 'fetched');
        await say(tweetToSlackMessage(tweet, mediaUrl, payload.user_name));
        await ack();
    } catch (error) {
        await say('Failed to fetch last tweet.');
        context.logError(error);
    }
});
