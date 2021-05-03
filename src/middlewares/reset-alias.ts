import { app } from '../app';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';

app.command('/reset', async ({ command, ack }) => {
    try {
        const storedHash = process.env.RESET_HASH;
        const digestedArg = Base64.stringify(sha256(command.text));
        if (storedHash === digestedArg) {
            console.log('password matches');
        } else {
            console.log('nope');
        }
    } catch (err) {
        await ack({
            mrkdwn: true,
            response_type: 'ephemeral',
            text: `Something went wrong, so you shouldn't play with this command if you have the password`,
        });
    }
});
