import {
    AllMiddlewareArgs,
    onlyViewActions,
    RespondArguments,
    SlackActionMiddlewareArgs,
    SlackCommandMiddlewareArgs,
    SlackViewMiddlewareArgs,
} from '@slack/bolt';
import { app } from '../app';

app.use(async (args) => {
    //TODO: replace the if statement with the following commented code.
    // https://github.com/slackapi/bolt-js/issues/911
    //await onlyCommands(args);

    const { context, next, ack, command } = args as SlackCommandMiddlewareArgs & AllMiddlewareArgs;
    if (!command) return await next?.();

    context.sendEphemeral = (text: string) =>
        ack({
            mrkdwn: true,
            response_type: 'ephemeral',
            text,
        });

    context.sendComposedEphemeral = (composedMessage: RespondArguments) => ack(composedMessage);

    return await next?.();
});

app.use(async (args) => {
    //TODO: replace the if statement with the following commented code.
    // https://github.com/slackapi/bolt-js/issues/911
    //onlyViewActions(args);

    //TODO: replace the code with the appropriate `ack` arguments when using views.
    const { context, ack, view } = args as SlackViewMiddlewareArgs & AllMiddlewareArgs;
    if (!view) return await args.next?.();

    context.sendEphemeral = (text: string) => ack();
    context.sendComposedEphemeral = (args: RespondArguments) => ack();

    return await args.next?.();
});

app.use(async (args) => {
    //TODO: replace the if statement with the following commented code.
    // https://github.com/slackapi/bolt-js/issues/911
    //onlyActions(args);

    //TODO: replace the code with the appropriate `ack` arguments when using views.
    const { context, ack, action } = args as SlackActionMiddlewareArgs & AllMiddlewareArgs;
    if (!action) return await args.next?.();

    context.sendEphemeral = (text: string) => ack();
    context.sendComposedEphemeral = (args: RespondArguments) => ack();

    return await args.next?.();
});
