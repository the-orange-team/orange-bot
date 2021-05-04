import { app } from '../app';
import { storage } from '../storage';
import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';

let devModeActivated: boolean = false;

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    ack,
    ...rest
}) => {
    await next?.();
};

app.command('/devMode', async ({ payload, command, ack }) => {
    try {
        if (true) {
            await ack({
                text: `dev mode activated, all hail the code supremacy. Now go fix that shit and :shipit:`,
                response_type: 'ephemeral',
            });
        } else {
            await ack({
                text: `You don't have credentials to activate dev mode :no_good:`,
                response_type: 'ephemeral',
            });
        }
    } catch (err) {
        await ack({
            response_type: 'ephemeral',
            text: `Something went wrong, contact @orangebotdevs and don't try this command again`,
        });
    }
});
