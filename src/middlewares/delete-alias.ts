import { app } from '../app';
import { deleteCommand } from '../messages';
import { storage } from '../storage';

app.command('/delete', async ({ command, ack }) => {
    try {
        const [aliasToDelete] = command.text.trim().split(' ');

        if (!aliasToDelete) {
            await ack({
                response_type: 'ephemeral',
                text: `Invalid command pattern.`,
            });
        }

        const wasCommandDeleted = await deleteCommand({ command: aliasToDelete }, storage);
        if (wasCommandDeleted) {
            await ack({
                response_type: 'ephemeral',
                text: `Command :${aliasToDelete} has been successfully deleted`,
            });
        } else {
            await ack({
                response_type: 'ephemeral',
                text: `The command :${aliasToDelete} does not exist. No-op.`,
            });
        }
    } catch (err) {
        console.log(err);
        app.error(err);
        await ack({
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
