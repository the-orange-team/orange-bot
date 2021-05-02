import { app } from '../app';
import { messageStartingWithColonRegex, returnCommand } from '../messages/messages';
import { textToSlackMessage } from '../messages/slackAdapter';
import { storage } from '../storage';

app.message(messageStartingWithColonRegex, async ({ context, say }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase();
        await say(`getting ${command}`);
        const value = await returnCommand(command, storage);
        await say(textToSlackMessage(command, value));
    } catch (error) {
        await say('command failed');
        app.error(error);
    }
});
