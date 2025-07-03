import { App, LogLevel } from '@slack/bolt';

const singleton = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    logLevel: LogLevel.INFO,
});

export const app = singleton;
