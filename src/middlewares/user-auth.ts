import { app } from '../app';
import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    ack,
    ...rest
}) => {
    await next?.();
};

app.command('/devmode', async ({ payload, ack }) => {
    const devIds = process.env.DEV_USER_GROUP;
    const devList: string[] = devIds?.substring(1, devIds.length - 1).split(',') ?? [];
    const devUser = devList.find((str) => str == payload.user_id);
    try {
        if (devUser) {
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
