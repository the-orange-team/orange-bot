import { app } from '../app';
import { getAliasResponse, wordStartingWithColonRegex, textToSlackMessage } from '../messages';
import { storage } from '../storage';
const tag = 'hidden-get-alias';

app.message(wordStartingWithColonRegex, async ({ context, say, logger }) => {
    // RegExp matches are inside of context.matches
    try {
        const command = context.matches[0].toLowerCase().trim();
        logger.info(`[get-alias] fetching ${command}`);
        const value =
            (await getAliasResponse(command, storage)) ??
            'Parece que esse alias não existe, digite `/help create` caso queira saber como criar um';
        const argument = await textToSlackMessage(command, value);
        await say(argument);
    } catch (error) {
        await say('A chamada do alias falhou, entre em contato com @orangebotdevs');
        context.logError(error);
    }
});

app.command('/hidden', async ({ command, context, ack }) => {
    try {
        context.logStep(tag, 'received');
        const value =
            (await getAliasResponse(command.text, storage)) ??
            'Parece que esse alias não existe, digite `/help create` caso queira saber como criar um';
        context.logStep(tag, 'retrieved');
        const argument = await textToSlackMessage(command.text, value);
        await ack(argument);
    } catch (err) {
        await ack('A chamada do alias falhou, entre em contato com @orangebotdevs');
        context.logError(err);
    }
});
