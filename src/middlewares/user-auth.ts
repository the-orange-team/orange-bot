import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { app } from '../app';
import { storage } from '../storage';
import { userIsDev } from '../utils/dev-user';

const tag = 'user-auth';

export const callAuthorized: Middleware<SlackCommandMiddlewareArgs> = async ({
    next,
    context,
    ...rest
}) => {
    const devModeActive = await storage.getDevMode();
    context.logStep(tag, 'user request intercepted');
    if (devModeActive === false || (devModeActive && userIsDev(rest.payload.user_id))) {
        context.logStep(tag, 'user access granted');
        await next?.();
    } else {
        context.logStep(tag, 'user access denied');
        await context.sendEphemeral(
            'Dev mode ativo, por enquanto apenas chamadas de alias estão disponíveis'
        );
    }
};

app.command('/devmode', async ({ payload, context }) => {
    try {
        context.logStep(tag, 'devmode change request received');
        const devModeActive = await storage.getDevMode();
        if (userIsDev(payload.user_id)) {
            context.logStep(tag, `dev mode switch allowed`);
            await storage.setDevModeTo(!devModeActive);
            context.logStep(tag, `Dev mode ativado: ${!devModeActive}`);
            await context.sendEphemeral(generateDevModeMessage(!devModeActive));
        } else {
            context.logStep(tag, `dev mode changes denied`);
            await context.sendEphemeral(
                `Você não tem permissão para modificar o dev mode :no_good:`
            );
        }
    } catch (err) {
        await context.sendEphemeral(
            `Algo deu errado, entre em contato com @orangebotdevs e não tente esse comando novamente`
        );
        context.logError(err as string);
    }
});

function generateDevModeMessage(devModeActive: boolean): string {
    if (devModeActive) {
        return 'dev mode activated, all hail the code supremacy. Now go fix that shit and :shipit:';
    } else {
        return "dev mode deactivated. I don't know who you are, I don't know what you want, but if there's any bug left, I will hunt you, and I will find you";
    }
}
