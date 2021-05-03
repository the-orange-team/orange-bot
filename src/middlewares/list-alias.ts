import { app } from '../app';
import { storage } from '../storage';

app.command('/list', async ({ ack }) => {
    try {
        let cursor = '0';
        let keys: string[] = [];

        do {
            const result = await storage.listAllKeysStartingFrom(cursor);
            cursor = result[0];
            keys = keys.concat(result[1]);
        } while (cursor != '0');

        if (keys) {
            await ack({
                text: keys.join(' \n '),
                response_type: 'ephemeral',
            });
        } else {
            await ack({
                mrkdwn: true,
                text: `Couldn't fetch the command list`,
                response_type: 'ephemeral',
            });
        }
    } catch (err) {
        console.log(err);
        await ack({
            mrkdwn: true,
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
