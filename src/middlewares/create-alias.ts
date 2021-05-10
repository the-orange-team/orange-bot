import { app } from '../app';
import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { createAlias, slackCommandToCommand } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';
import { getModalSchema } from '../modals/create-alias/create-alias-modal';
import { fileSystem } from '../hosting';

const tag = 'create-alias';

app.command('/create', callAuthorized, async ({ ack, client, context, payload, body }) => {
    try {
        const modalSchema = getModalSchema(body);
        await ack(modalSchema);
        const result = await client.views.open(modalSchema);
        console.log(result);
        context.logStep(tag, 'received');
        await context.sendEphemeral('Not implemented yet');
    } catch (err) {
        await context.sendEphemeral('Something went wrong');
        context.logError(err);
    }
});

app.view('create_alias_view', async (args) => {
    console.log(args);
    args.ack();
});

const createAliasRequestedFromText: Middleware<SlackCommandMiddlewareArgs> = async (args) => {
    try {
        args.context.logStep(tag, 'received');
        const botCommand = slackCommandToCommand(args.command);
        if (botCommand) {
            args.context.logStep(tag, 'validated');
            const uploadedCommand = await fileSystem.uploadAlias(botCommand);
            args.context.logStep(tag, 'uploaded');
            createAlias(uploadedCommand, storage);
            args.context.logStep(tag, 'stored');
            await args.context.sendEphemeral(
                `You can now use the alias writing :${botCommand.text}`
            );
        } else {
            args.context.logStep(tag, 'invalidated');
            await args.context.sendEphemeral('Invalid command pattern');
        }
    } catch (err) {
        await args.context.sendEphemeral('Something went wrong');
        args.context.logError(err);
    }
};

app.command('/cmdcrt', callAuthorized, createAliasRequestedFromText);
