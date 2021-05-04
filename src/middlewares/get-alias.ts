import { app } from '../app';
import { messageStartingWithColonRegex, getCommandResponse, textToSlackMessage } from '../messages';
import { storage } from '../storage';

app.message(messageStartingWithColonRegex, async ({ context, say, logger }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase();
        logger.info(`[get-alias] fetching ${command}`);
        const value = (await getCommandResponse(command, storage)) ?? "command doesn't exist";
        await say(textToSlackMessage(command, value));
    } catch (error) {
        await say('Command failed');
        logger.error(error);
    }
});
