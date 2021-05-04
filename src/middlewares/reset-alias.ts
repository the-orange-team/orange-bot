import { app } from '../app';
import { callAuthorized } from './user-auth';
import { storage } from '../storage';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';

app.command('/reset', callAuthorized, async ({ command, ack }) => {
    try {
        const storedHash = process.env.RESET_HASH;
        const digestedArg = Base64.stringify(sha256(command.text));
        if (storedHash === digestedArg) {
            await storage.deleteAllKeys();
            await ack({
                text: `Bot storage flushed, this was his final words: I'll be back :fire::fire::thumbsup::fire::fire:`,
                response_type: 'ephemeral',
            });
        } else {
            await ack({
                text: `You don't know the password and you shouldn't play with this command`,
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
