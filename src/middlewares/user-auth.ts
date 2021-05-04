import { app } from '../app';
import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';

let devModeActive = false;

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    ack,
    ...rest
}) => {
    if (devModeActive == false || (devModeActive && userIsDev(rest.payload.user_id))) {
        await next?.();
    }
};

app.command('/devmode', async ({ payload, ack }) => {
    try {
        if (userIsDev(payload.user_id)) {
            devModeActive = !devModeActive;
            let output: string;
            await ack({
                text: generateDevModeMessage(),
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

function userIsDev(userId: string): boolean {
    const devIds = process.env.DEV_USER_GROUP;
    const devList: string[] = devIds?.substring(1, devIds.length - 1).split(',') ?? [];
    const devUser = devList.find((str) => str == userId);
    if (devUser) return true;
    else return false;
}

function generateDevModeMessage(): string {
    if (devModeActive) {
        return 'dev mode activated, all hail the code supremacy. Now go fix that shit and :shipit:';
    } else {
        return "I don't know who you are, I don't know what you want, but if there's any bug left, I will hunt you, and I will find you";
    }
}
