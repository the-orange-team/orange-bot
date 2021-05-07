import { app } from '../app';
import { createAlias, slackCommandToCommand } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';
import { getModalSchema } from '../modals/create-alias/create-alias-modal';
import { fileSystem } from '../hosting';
const tag = 'create-alias';

app.command('/create', callAuthorized, async ({ client, context, payload }) => {
    try {
        const result = await client.views.open(getModalSchema(payload));
        console.log(result);
        context.logStep(tag, 'received');
        await context.sendEphemeral('Not implemented yet');
    } catch (err) {
        await context.sendEphemeral('Something went wrong');
        context.logError(err);
    }
});

app.command('/cmdcrt', callAuthorized, async ({ command, context }) => {
    try {
        context.logStep(tag, 'received');
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            context.logStep(tag, 'validated');
            const uploadedCommand = await fileSystem.uploadAlias(botCommand);
            context.logStep(tag, 'uploaded');
            createAlias(uploadedCommand, storage);
            context.logStep(tag, 'stored');
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
