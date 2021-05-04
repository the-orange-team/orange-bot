import { app } from '../app';
import { callAuthorized } from './user-auth';
import { slackCommandToCommand, createCommand, getCommandResponse } from '../messages';
import { storage } from '../storage';

app.command('/replace', callAuthorized, async ({ command, ack, logger }) => {
    try {
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            const isCommandRegistered = await getCommandResponse(botCommand.text, storage);
            if (isCommandRegistered) {
                await createCommand(botCommand, storage);
                await ack({
                    text: `Alias ${botCommand.text} has been successfully replaced`,
                    response_type: 'ephemeral',
                });
            } else {
                await ack({
                    response_type: 'ephemeral',
                    text: `Alias ${botCommand.text} does not exist. You can create it using \`/create\`.`,
                });
            }
        } else {
            await ack({
                response_type: 'ephemeral',
                text: `Invalid command pattern.`,
            });
        }
    } catch (err) {
        logger.error(err);
        await ack({
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
