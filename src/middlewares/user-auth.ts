import { app } from '../app';
import { SlackCommandMiddlewareArgs, Middleware } from '@slack/bolt';
import { storage } from '../storage';

const tag = 'user-auth';

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    context,
    ...rest
}) => {
    const devModeActive = await storage.getDevMode();
    if (devModeActive === false || (devModeActive && userIsDev(rest.payload.user_id))) {
        context.logStep(tag, 'user access granted');
        await next?.();
    } else {
        context.logStep(tag, 'user access denied');
        await context.sendEphemeral(
            "Dev mode is active, and I can't do much right now, try again later"
        );
    }
};

app.command('/devmode', async ({ payload, context }) => {
    try {
        context.logStep(tag, 'received');
        const devModeActive = await storage.getDevMode();
        if (userIsDev(payload.user_id)) {
            context.logStep(tag, `dev mode changes allowed`);
            await storage.setDevModeTo(!devModeActive);
            context.logStep(tag, `dev mode changed to: ${devModeActive}`);
            await context.sendEphemeral(generateDevModeMessage(!devModeActive));
        } else {
            context.logStep(tag, `dev mode changes denied`);
            await context.sendEphemeral(`You don't have credentials to change dev mode :no_good:`);
        }
    } catch (err) {
        await context.sendEphemeral(
            `Something went wrong, contact @orangebotdevs and don't try this command again`
        );
        context.logError(err);
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
