import { app } from '../app';
import { storage } from '../storage';

app.command('/list', async ({ ack, logger }) => {
    try {
        let cursor = '0';
        let keys: string[] = [];

        do {
            const result = await storage.listAllKeysStartingFrom(cursor);
            cursor = result[0];
            keys = keys.concat(result[1]);
        } while (cursor != '0');

        if (keys.length > 0) {
            await ack({
                text: keys.join(' \n '),
                response_type: 'ephemeral',
            });
        } else {
            await ack({
                text: `Couldn't fetch the commands list`,
                response_type: 'ephemeral',
            });
        }
    } catch (err) {
        logger.error(err);
        await ack({
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
