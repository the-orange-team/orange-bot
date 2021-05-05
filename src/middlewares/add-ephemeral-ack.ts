import { RespondArguments, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { app } from '../app';

declare module '@slack/bolt' {
    interface Context {
        sendEphemeral: (text: string) => Promise<void> | undefined;
        sendComposedEphemeral: (composedMessage: RespondArguments) => Promise<void> | undefined;
    }
}

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
