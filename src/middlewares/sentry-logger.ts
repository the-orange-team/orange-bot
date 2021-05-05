import { RespondArguments, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { app } from '../app';
import { orangeLogger } from '../logger';

app.use(async ({ context, next, logger, ...rest }) => {
    const commandArgs = rest as Partial<SlackCommandMiddlewareArgs>;

    context.sendEphemeral = (text: string) =>
        commandArgs.ack?.({
            mrkdwn: true,
            response_type: 'ephemeral',
            text,
        });

    context.sendComposedEphemeral = (composedMessage: RespondArguments) =>
        commandArgs.ack?.(composedMessage);

    if (commandArgs.payload) {
        context.logStep = orangeLogger.logStep.bind(orangeLogger, logger, commandArgs.payload);
    }
    context.logError = orangeLogger.logError.bind(
        orangeLogger,
        logger,
        commandArgs.payload ?? null
    );

    await next?.();
});