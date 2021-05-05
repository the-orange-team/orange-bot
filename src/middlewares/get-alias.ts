import { app } from '../app';
import { messageStartingWithColonRegex, getCommandResponse, textToSlackMessage } from '../messages';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

app.message(messageStartingWithColonRegex, async ({ payload, context, say, logger }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase();
        logger.info(`[get-alias] fetching ${command}`);
        const value = (await getCommandResponse(command, storage)) ?? "alias doesn't exist";
        await say(textToSlackMessage(command, value));
    } catch (error) {
        await say('alias call failed, @orangebotdevs');
        orangeLogger.logError(error);
    }
});
