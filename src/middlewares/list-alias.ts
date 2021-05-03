import { app } from '../app';
import { storage } from '../storage';

app.command('/list', async ({ ack }) => {
    try {
        const keys = await storage.listAllValues();
        if (keys) {
            console.log(keys);
            await ack({
                text: keys.join(' \n '),
                response_type: 'ephemeral',
            });
        } else {
            console.log('empty key list');
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
