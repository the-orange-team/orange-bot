import { app } from '../app';
import { callAuthorized } from './user-auth';
import { storage } from '../storage';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import { orangeLogger } from '../logger';

const tag = 'reset-alias';

app.command('/reset', callAuthorized, async ({ logger, payload, command, context }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        const storedHash = process.env.RESET_HASH;
        const digestedArg = Base64.stringify(sha256(command.text));
        if (storedHash === digestedArg) {
            orangeLogger.logStep(logger, tag, 'authorized', payload);
            await storage.deleteAllKeys();
            orangeLogger.logStep(logger, tag, 'database flushed', payload);
            await context.sendEphemeral(
                `Bot storage flushed, this was his final words: I'll be back :fire::fire::thumbsup::fire::fire:`
            );
        } else {
            orangeLogger.logStep(logger, tag, 'denied', payload);
            await context.sendEphemeral(
                `You don't know the password and you shouldn't play with this command`
            );
        }
    } catch (err) {
        await context.sendEphemeral(
            `Something went wrong, contact @orangebotdevs and don't try this command again`
        );
        orangeLogger.logError(err, payload);
    }
});
