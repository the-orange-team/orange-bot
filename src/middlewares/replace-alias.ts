import { app } from '../app';
import { slackCommandToCommand, createCommand, returnCommand } from '../messages';
import { storage } from '../storage';

app.command('/replace', async ({ command, ack, say }) => {
    try {
        await ack();
        const botCommand = slackCommandToCommand(command.text);
        if (botCommand) {
            const isCommandRegistered = await returnCommand(botCommand.command, storage);
            if (isCommandRegistered) {
                await createCommand(botCommand, storage);
                await say(`Command :${botCommand.command} has been successfully replaced`);
            } else {
                await say({
                    mrkdwn: true,
                    text: `Command :${botCommand.command} does not exist. You can create it using \`/create\`.`,
                });
            }
        } else {
            await say('Invalid command pattern');
        }
    } catch (err) {
        await say('Something went wrong');
    }
});
