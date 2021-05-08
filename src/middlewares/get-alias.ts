import { app } from '../app';
import { getAliasResponse, messageStartingWithColonRegex, textToSlackMessage } from '../messages';
import { storage } from '../storage';
const tag = 'hidden-get-alias';

app.message(messageStartingWithColonRegex, async ({ context, say, logger }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase();
        logger.info(`[get-alias] fetching ${command}`);
        const value = (await getAliasResponse(command, storage)) ?? "alias doesn't exist";
        const argument = await textToSlackMessage(command, value);
        await say(argument);
    } catch (error) {
        await say('alias call failed, ping @orangebotdevs');
        context.logError(error);
    }
});

app.command('/hidden', async ({ command, context, ack }) => {
    try {
        context.logStep(tag, 'received');
        const value = (await getAliasResponse(command.text, storage)) ?? "alias doesn't exist";
        context.logStep(tag, 'retrieved');
        const argument = await textToSlackMessage(command.text, value);
        await ack(argument);
    } catch (err) {
        await ack('alias call failed, ping @orangebotdevs');
        context.logError(err);
    }
});
