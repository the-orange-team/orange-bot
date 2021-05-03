import { app } from '../app';
import { slackCommandToCommand, createCommand } from '../messages';
import { storage } from '../storage';

app.command('/create', async ({ command, ack }) => {
    try {
        const botCommand = slackCommandToCommand(command.text);
        if (botCommand) {
            createCommand(botCommand, storage);
            await ack({
                response_type: 'ephemeral',
                text: `You can now use the command writing :${botCommand.command}`,
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
