import { app } from '../app';
import { createAlias, slackCommandToCommand } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';

const tag = 'create-alias';

app.command('/create', callAuthorized, async ({ command, context }) => {
    try {
        context.logStep(tag, 'received');
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            context.logStep(tag, 'validated');
            createAlias(botCommand, storage);
            context.logStep(tag, 'created');
            await context.sendEphemeral(`You can now use the alias writing :${botCommand.text}`);
        } else {
            context.logStep(tag, 'invalidated');
            await context.sendEphemeral('Invalid command pattern');
        }
    } catch (err) {
        await context.sendEphemeral('Something went wrong');
        context.logError(err);
    }
});
