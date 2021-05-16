import Base64 from 'crypto-js/enc-base64';
import sha256 from 'crypto-js/sha256';
import { app } from '../app';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';

const tag = 'reset-alias';

app.command('/reset', callAuthorized, async ({ command, context }) => {
    try {
        context.logStep(tag, 'received');
        const storedHash = process.env.RESET_HASH;
        const digestedArg = Base64.stringify(sha256(command.text));
        if (storedHash === digestedArg) {
            context.logStep(tag, 'authorized');
            await storage.deleteAllKeys();
            context.logStep(tag, 'database flushed');
            await context.sendEphemeral(
                `Bot storage flushed, this was his final words: I'll be back :fire::fire::thumbsup::fire::fire:`
            );
        } else {
            context.logStep(tag, 'denied');
            await context.sendEphemeral(
                `Se você não sabe a senha, significa que você não deveria utilizar esse comando`
            );
        }
    } catch (err) {
        await context.sendEphemeral(
            `Algo deu errado, entre em contato com @orangebotdevs e não tente esse comando novamente`
        );
        context.logError(err);
    }
});
