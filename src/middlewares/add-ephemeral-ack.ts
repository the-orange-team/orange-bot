import { RespondArguments, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { app } from '../app';

app.use(async ({ context, next, ...rest }) => {
    const commandArgs = rest as Partial<SlackCommandMiddlewareArgs>;

    context.sendEphemeral = (text: string) =>
        commandArgs.ack?.({
            mrkdwn: true,
            response_type: 'ephemeral',
            text,
        });

    context.sendComposedEphemeral = (composedMessage: RespondArguments) =>
        commandArgs.ack?.(composedMessage);

    await next?.();
});
