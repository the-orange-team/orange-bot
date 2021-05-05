import { app } from '../app';
import { SlashCommand, Logger } from '@slack/bolt';
import * as Sentry from '@sentry/node';

const sentry = Sentry;

export interface OrangeLogger {
    logError: (error: any, payload?: SlashCommand) => void;
    logStep: (logger: Logger, category: string, message: any, payload: SlashCommand) => void;
}

class LoggerImplementation implements OrangeLogger {
    constructor() {
        sentry.init({
            dsn: process.env.SENTRY_DSN,
        });
    }

    logError(error: any, payload?: SlashCommand) {
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

        console.error(error);
        app.error(error);
    }

    logStep(logger: Logger, category: string, message: any, payload: SlashCommand) {
        sentry.addBreadcrumb({
            category: category,
            message: message,
            level: Sentry.Severity.Info,
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
