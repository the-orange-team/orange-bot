import { App } from '@slack/bolt';

const singleton = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

export const app = singleton;
