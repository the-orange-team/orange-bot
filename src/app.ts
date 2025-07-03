import { App, LogLevel } from '@slack/bolt';
import { registerBolaoCommands } from './bolao/commands';

const singleton = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    logLevel: LogLevel.INFO,
});

registerBolaoCommands(singleton);

export const app = singleton;
