import { app } from '../app';
import { storage } from '../storage';

app.command('/list', async ({ ack, logger }) => {
    try {
        const keys = await storage.getAllKeys();

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
