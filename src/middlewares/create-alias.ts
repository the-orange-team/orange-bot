import { app } from '../app';
import { callAuthorized } from './user-auth';
import { slackCommandToCommand, createCommand } from '../messages';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

const tag = 'create-alias';

app.command('/create', callAuthorized, async ({ payload, command, logger, context }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            orangeLogger.logStep(logger, tag, 'validated', payload);
            createCommand(botCommand, storage);
            orangeLogger.logStep(logger, tag, 'created', payload);
            await context.sendEphemeral(`You can now use the alias writing :${botCommand.text}`);
        } else {
            orangeLogger.logStep(logger, tag, 'invalidated', payload);
            await context.sendEphemeral('Invalid command pattern');
        }
    } catch (err) {
        await context.sendEphemeral('Something went wrong');
        orangeLogger.logError(err, payload);
    }
});
