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

        await ack({
            text: keys.length ? keys.join(' \n ') : 'No commands were created yet.',
            response_type: 'ephemeral',
        });
    } catch (err) {
        logger.error(err);
        await ack({
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
