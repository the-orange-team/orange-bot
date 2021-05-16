import { getLastPokeDolarTweet } from '../apis/twitter/twitter';
import { app } from '../app';
import { tweetToSlackMessage } from '../messages';
import { callAuthorized } from './user-auth';

const tag = 'pokedolar';

app.command('/pokedolar', callAuthorized, async ({ say, ack, context, payload }) => {
    try {
        context.logStep(tag, 'received');
        const { tweet, mediaUrl } = await getLastPokeDolarTweet();
        context.logStep(tag, 'fetched');
        await say(tweetToSlackMessage(tweet, mediaUrl, payload.user_name));
        await ack();
    } catch (error) {
        await say('Não foi possível obter o último tweet.');
        context.logError(error);
    }
});
