import { app } from '../app';
import { Context, Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { createAlias, slackCommandToCommand } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';
import { getModalSchema } from '../modals/create-alias/create-alias-modal';
import { fileSystem, InvalidAliasError } from '../hosting';
import { parseViewDataToAlias, ViewBlock } from '../utils';
import { Alias } from '../messages';

const tag = 'create-alias';

app.command('/create', callAuthorized, async ({ ack, client, context, body }) => {
    try {
        const modalSchema = getModalSchema(body);
        await client.views.open(modalSchema);
        context.logStep(tag, 'received');
        await ack();
    } catch (err) {
        await context.sendEphemeral(`Something went wrong: ${err.message}`);
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
    await createAlias(uploadedCommand, storage);
    context.logStep(tag, 'stored');
    return await context.sendEphemeral(`You can now use the alias writing :${alias.text}`);
};

// TODO: fix logStep function. it's being bound correctly, but the payload object in here is different from the payload object used.
app.view('create_alias_view', async ({ body, context, ack }) => {
    try {
        const alias = parseViewDataToAlias(body);
        if (!alias) return;

        await createAliasWithContext(alias, context);
    } catch (err: any) {
        if (err instanceof InvalidAliasError) {
            const invalidBlocks = Object.entries(body.view.state.values)
                .filter(
                    ([, actionDict]: [string, ViewBlock]) =>
                        Object.values(actionDict)[0].value === err.url
                )
                .map(([blockId]) => ({ [blockId]: err.message }));

            const invalidBlocksErrors = Object.assign({}, ...invalidBlocks);

            return await ack({
                response_action: 'errors',
                errors: invalidBlocksErrors,
            });
        } else {
            console.log(err);
            return await ack({
                response_action: 'errors',
                errors: {},
            });
        }
    }
});

const createAliasRequestedFromText: Middleware<SlackCommandMiddlewareArgs> = async ({
    context,
    command,
}) => {
    try {
        context.logStep(tag, 'received');
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            await createAliasWithContext(botCommand, context);
        } else {
            context.logStep(tag, 'invalidated');
            await context.sendEphemeral('Invalid command pattern');
        }
    } catch (err) {
        await context.sendEphemeral(`Something went wrong: ${err.message}`);
        context.logError(err.message);
    }
};

app.command('/cmdcrt', callAuthorized, createAliasRequestedFromText);
