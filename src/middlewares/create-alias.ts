import { app } from '../app';
import { callAuthorized } from './user-auth';
import { slackCommandToCommand, createCommand } from '../messages';
import { storage } from '../storage';

app.command('/create', callAuthorized, async ({ command, ack }) => {
    try {
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            createCommand(botCommand, storage);
            await ack({
                response_type: 'ephemeral',
                text: `You can now use the alias writing :${botCommand.text}`,
            });
        } else {
            await ack({
                response_type: 'ephemeral',
                text: 'Invalid command pattern',
            });
        }
    } catch (err) {
        await ack({
            response_type: 'ephemeral',
            text: 'Something went wrong',
        });
        console.error(err);
        app.error(err);
    }
});
