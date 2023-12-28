import * as Sentry from '@sentry/node';
import { Logger, SlashCommand } from '@slack/bolt';

const sentry = Sentry;

export interface OrangeLogger {
    logError: (logger: Logger, payload: SlashCommand, error: string) => void;
    logStep: (logger: Logger, payload: SlashCommand, category: string, message: string) => void;
}

class LoggerImplementation implements OrangeLogger {
    constructor() {
        sentry.init({
            dsn: process.env.SENTRY_DSN,
        });
    }

    logError(logger: Logger, payload: SlashCommand | null, error: string) {
        if (payload)
            sentry.withScope((scope) => {
                scope.setUser({
                    user: payload.user_name,
                    channel: payload.channel_name,
                    command: payload.command,
                    text: payload.text,
                });
                sentry.captureException(error);
            });
        else sentry.captureException(error);

        logger.error(error);
    }

    logStep(logger: Logger, payload: SlashCommand, category: string, message: string) {
        sentry.addBreadcrumb({
            category: category,
            message: message,
            level: 'info',
            data: {
                user: payload.user_name,
                channel: payload.channel_name,
                command: payload.command,
                text: payload.text,
            },
        });
        logger.info(
            `[${category}] ${message} ${payload.text} [by ${payload.user_name} at ${payload.channel_name}]`
        );
    }
}

export const orangeLogger = new LoggerImplementation();
