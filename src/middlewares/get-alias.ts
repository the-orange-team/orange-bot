import { app } from '../app';
import { messageStartingWithColonRegex, returnCommand, textToSlackMessage } from '../messages';
import { storage } from '../storage';

app.message(messageStartingWithColonRegex, async ({ context, say }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase();
        await say(`getting ${command}`);
        const value = (await returnCommand(command, storage)) ?? "command doesn't exist";
        await say(textToSlackMessage(command, value));
    } catch (error) {
        await say('command failed');
        app.error(error);
    }
});
