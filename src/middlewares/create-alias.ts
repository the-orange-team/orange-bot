import { app } from '../app';
import {
    Context,
    ContextMissingPropertyError,
    Middleware,
    SlackCommandMiddlewareArgs,
} from '@slack/bolt';
import { createAlias, slackCommandToCommand } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';
import { getModalSchema } from '../modals/create-alias/create-alias-modal';
import { fileSystem } from '../hosting';
import { parseViewDataToAlias } from '../utils';
import { Alias } from '../messages';

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

const createAliasWithContext = async (
    alias: Alias,
    context: Context
): Promise<void | undefined> => {
    context.logStep(tag, 'validated');
    const uploadedCommand = await fileSystem.uploadAlias(alias);
    context.logStep(tag, 'uploaded');
    createAlias(uploadedCommand, storage);
    context.logStep(tag, 'stored');
    return await context.sendEphemeral(`You can now use the alias writing :${alias.text}`);
};

app.view('create_alias_view', async ({ body, context }) => {
    const alias = parseViewDataToAlias(body);
    if (!alias) return;

    await createAliasWithContext(alias, context);
});

const createAliasRequestedFromText: Middleware<SlackCommandMiddlewareArgs> = async ({
    context,
    command,
}) => {
    try {
        context.logStep(tag, 'received');
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            createAliasWithContext(botCommand, context);
        } else {
            context.logStep(tag, 'invalidated');
            await context.sendEphemeral('Invalid command pattern');
        }
    } catch (err) {
        await context.sendEphemeral('Something went wrong');
        context.logError(err);
    }
};

app.command('/cmdcrt', callAuthorized, createAliasRequestedFromText);
