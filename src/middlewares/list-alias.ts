import { app } from '../app';
import { storage } from '../storage';

app.command('/list', async ({ ack, logger }) => {
    try {
        const aliasesKeys = await storage.getAllAliasesKeys();

        const allAliases = await storage.getAliasesByKeys(aliasesKeys);

        await ack({
            text: aliasesKeys.length ? aliasesKeys.join(' \n ') : 'No commands were created yet.',
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
