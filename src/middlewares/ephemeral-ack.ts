import {
    AllMiddlewareArgs,
    onlyActions,
    onlyCommands,
    onlyViewActions,
    RespondArguments,
    SlackCommandMiddlewareArgs,
    SlackViewMiddlewareArgs,
} from '@slack/bolt';
import { app } from '../app';

app.use(async (args) => {
    await onlyCommands(args);
    const { context, next, ack } = args as SlackCommandMiddlewareArgs & AllMiddlewareArgs;

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
    //onlyActions(args);

    //TODO: replace the code with the appropriate `ack` arguments when using views.
    if ((args as SlackViewMiddlewareArgs).view) {
        const { context, ack } = args as SlackViewMiddlewareArgs & AllMiddlewareArgs;
        context.sendEphemeral = (text: string) => ack();
        context.sendComposedEphemeral = (args: RespondArguments) => ack();
    }

    return await args.next?.();
});
