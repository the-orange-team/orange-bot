import { app } from '../app';
import { getAliasResponse, messageStartingWithColonRegex, textToSlackMessage } from '../messages';
import { storage } from '../storage';
import { fileSystem } from '../hosting';

app.message(messageStartingWithColonRegex, async ({ context, say, logger }) => {
    // RegExp matches are inside of context.matches
    try {
        await fileSystem.uploadURL('', '');
        const command = context.matches[0].toLowerCase();
        logger.info(`[get-alias] fetching ${command}`);
        const value = (await getAliasResponse(command, storage)) ?? "alias doesn't exist";
        await say(textToSlackMessage(command, value));
    } catch (error) {
        await say('alias call failed, @orangebotdevs');
        context.logError(error);
    }
});
