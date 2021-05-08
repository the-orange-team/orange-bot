import { app } from '../app';
import { getAliasResponse, messageStartingWithColonRegex, textToSlackMessage } from '../messages';
import { storage } from '../storage';

app.message(messageStartingWithColonRegex, async ({ context, say, logger }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase();
        logger.info(`[get-alias] fetching ${command}`);
        const value = (await getAliasResponse(command, storage)) ?? "alias doesn't exist";
        const argument = await textToSlackMessage(command, value);
        await say(argument);
    } catch (error) {
        await say('alias call failed, @orangebotdevs');
        context.logError(error);
    }
});
