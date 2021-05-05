import { app } from '../app';
import { callAuthorized } from './user-auth';
import { slackCommandToCommand, createCommand, getCommandResponse } from '../messages';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

const tag = 'replace-alias';

app.command('/replace', callAuthorized, async ({ payload, command, context, logger }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            orangeLogger.logStep(logger, tag, 'validated', payload);
            const isCommandRegistered = await getCommandResponse(botCommand.text, storage);
            if (isCommandRegistered) {
                orangeLogger.logStep(logger, tag, 'found', payload);
                await createCommand(botCommand, storage);
                orangeLogger.logStep(logger, tag, 'updated', payload);
                await context.sendEphemeral(
                    `Alias ${botCommand.text} has been successfully replaced`
                );
            } else {
                orangeLogger.logStep(logger, tag, 'not found', payload);
                await context.sendEphemeral(
                    `Alias ${botCommand.text} does not exist. You can create it using \`/create\`.`
                );
            }
        } else {
            orangeLogger.logStep(logger, tag, 'invalidated', payload);
            await context.sendEphemeral(`Invalid command pattern.`);
        }
    } catch (err) {
        await context.sendEphemeral(`Something went wrong`);
        orangeLogger.logError(err, payload);
    }
});
