import { app } from '../app';
import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

const tag = 'user-auth';

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    ack,
    ...rest
}) => {
    const devModeActive = await storage.getDevMode();
    if (devModeActive === false || (devModeActive && userIsDev(rest.payload.user_id))) {
        orangeLogger.logStep(rest.logger, tag, 'user access granted', rest.payload);
        await next?.();
    } else {
        orangeLogger.logStep(rest.logger, tag, 'user access denied', rest.payload);
        await ack({
            text: "Dev mode is active, and I can't do much right now, try again later",
            response_type: 'ephemeral',
        });
    }
};

app.command('/devmode', async ({ payload, ack, logger }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        const devModeActive = await storage.getDevMode();
        if (userIsDev(payload.user_id)) {
            orangeLogger.logStep(logger, tag, `dev mode changes allowed`, payload);
            await storage.setDevModeTo(!devModeActive);
            orangeLogger.logStep(logger, tag, `dev mode changed to: ${devModeActive}`, payload);
            await ack({
                text: generateDevModeMessage(!devModeActive),
                response_type: 'ephemeral',
            });
        } else {
            orangeLogger.logStep(logger, tag, `dev mode changes denied`, payload);
            await ack({
                text: `You don't have credentials to change dev mode :no_good:`,
                response_type: 'ephemeral',
            });
        }
    } catch (err) {
        await ack({
            response_type: 'ephemeral',
            text: `Something went wrong, contact @orangebotdevs and don't try this command again`,
        });
        orangeLogger.logError(err, payload);
    }
});

function userIsDev(userId: string): boolean {
    const devIds = process.env.DEV_USER_GROUP;
    const devList: string[] = devIds?.substring(1, devIds.length - 1).split(',') ?? [];
    const devUser = devList.find((str) => str == userId);
    if (devUser) return true;
    else return false;
}

function generateDevModeMessage(devModeActive: boolean): string {
    if (devModeActive) {
        return 'dev mode activated, all hail the code supremacy. Now go fix that shit and :shipit:';
    } else {
        return "dev mode deactivated. I don't know who you are, I don't know what you want, but if there's any bug left, I will hunt you, and I will find you";
    }
}
