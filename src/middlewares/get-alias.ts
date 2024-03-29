import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';
import { app } from '../app';
import { getAliasResponse, wordStartingWithColonRegex, textToSlackMessage } from '../messages';
import { storage } from '../storage';
const tag = 'hidden-get-alias';

const handleMessage: Middleware<SlackEventMiddlewareArgs<'message'>> = async ({
    context,
    say,
    logger,
    message,
}) => {
    try {
        if (message.subtype !== undefined) return;
        const command = context.matches[0].toLowerCase().trim();
        logger.info(`[get-alias] fetching ${command}`);

        const value = await getAliasResponse(command, storage);
        if (value) {
            const ts = message.thread_ts;
            const argument = await textToSlackMessage(command, value, ts);
            logger.info(`[get-alias] ${command} retrieved as ${argument}`);
            console.log(argument);
            await say(argument);
        } else {
            logger.info(`[get-alias] fetching ${command} failed`);
        }
    } catch (err: any) {
        await say('A chamada do alias falhou, entre em contato com @orangebotdevs');
        context.logError(err);
    }
};

app?.message(wordStartingWithColonRegex, handleMessage);

app.command('/hidden', async ({ command, context, ack }) => {
    try {
        context.logStep(tag, 'received');
        const value =
            (await getAliasResponse(command.text, storage)) ??
            'Parece que esse alias não existe, digite `/help create` caso queira saber como criar um';
        context.logStep(tag, 'retrieved');
        const threadId = undefined;
        const argument = await textToSlackMessage(command.text, value, threadId);
        await ack(argument);
    } catch (err: any) {
        await ack('A chamada do alias falhou, entre em contato com @orangebotdevs');
        context.logError(err);
    }
});
