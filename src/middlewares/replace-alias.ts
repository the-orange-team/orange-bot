import { app } from '../app';
import { callAuthorized } from './user-auth';
import { slackCommandToCommand, createCommand, getCommandResponse } from '../messages';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

const tag = 'replace-alias';

app.command('/replace', callAuthorized, async ({ payload, command, context, logger }) => {
    try {
        context.logStep(tag, 'received');
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            context.logStep(tag, 'validated');
            const isCommandRegistered = await getCommandResponse(botCommand.text, storage);
            if (isCommandRegistered) {
                context.logStep(tag, 'found');
                await createCommand(botCommand, storage);
                context.logStep(tag, 'updated');
                await context.sendEphemeral(
                    `Alias ${botCommand.text} has been successfully replaced`
                );
            } else {
                context.logStep(tag, 'not found');
                await context.sendEphemeral(
                    `Alias ${botCommand.text} does not exist. You can create it using \`/create\`.`
                );
            }
        } else {
            context.logStep(tag, 'invalidated');
            await context.sendEphemeral(`Invalid command pattern.`);
        }
    } catch (err) {
        await context.sendEphemeral(`Something went wrong`);
        context.logError(err);
    }
});
