import { app } from '../app';
import { slackCommandToCommand, createCommand } from '../messages';
import { storage } from '../storage';

app.command('/create', async ({ command, ack, say }) => {
    try {
        await ack();
        const botCommand = slackCommandToCommand(command.text);
        if (botCommand) {
            createCommand(botCommand, storage);
            await say(`You can now use the command writing :${botCommand.command}`);
        } else {
            await say('Invalid command pattern');
        }
    } catch (err) {
        await say('Something went wrong');
    }
});
