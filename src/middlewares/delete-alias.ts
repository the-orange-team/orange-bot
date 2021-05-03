import { app } from '../app';
import { deleteCommand } from '../messages';
import { storage } from '../storage';

app.command('/delete', async ({ command, ack, logger }) => {
    try {
        logger.info(`[delete] deleting command invoked.`);
        const [aliasToDelete] = command.text.trim().split(' ');

        if (!aliasToDelete) {
            await ack({
                response_type: 'ephemeral',
                text: `Invalid command pattern.`,
            });
        }
        logger.info(`[delete] target alias: ${aliasToDelete}. trying to delete...`);

        const wasCommandDeleted = await deleteCommand({ command: aliasToDelete }, storage);
        if (wasCommandDeleted) {
            logger.info(`[delete] ${aliasToDelete} deleted.`);
            await ack({
                response_type: 'ephemeral',
                text: `Command :${aliasToDelete} has been successfully deleted`,
            });
        } else {
            logger.info(`[delete] ${aliasToDelete} does not exist.`);
            await ack({
                response_type: 'ephemeral',
                text: `The command :${aliasToDelete} does not exist. No-op.`,
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
