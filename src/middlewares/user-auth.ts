import { app } from '../app';
import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    ack,
    ...rest
}) => {
    await next?.();
};

app.command('/devMode', async ({ payload, ack }) => {
    try {
        if (payload.user_id === 'U03RG3GSB') {
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
