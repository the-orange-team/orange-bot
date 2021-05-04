import { app } from '../app';
import { slackCommandToCommand, createCommand, getCommandResponse } from '../messages';
import { storage } from '../storage';

app.command('/replace', async ({ command, ack, logger }) => {
    try {
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            const isCommandRegistered = await getCommandResponse(botCommand.command, storage);
            if (isCommandRegistered) {
                await createCommand(botCommand, storage);
                await ack({
                    text: `Command :${botCommand.command} has been successfully replaced`,
                    response_type: 'ephemeral',
                });
            } else {
                await ack({
                    response_type: 'ephemeral',
                    text: `Command :${botCommand.command} does not exist. You can create it using \`/create\`.`,
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
