import { app } from '../app';
import { callAuthorized } from './user-auth';
import { deleteCommand } from '../messages';
import { storage } from '../storage';

app.command('/delete', callAuthorized, async ({ command, ack, logger }) => {
    try {
        logger.info(`[delete] deleting command invoked.`);
        const [aliasToDelete] = command.text.trim().split(' ');

        if (!aliasToDelete) {
            await ack({
                response_type: 'ephemeral',
                text: `Invalid command pattern.`,
            });
        }
        logger.info(`[delete] target alias ${aliasToDelete}. trying to delete...`);

        const wasCommandDeleted = await deleteCommand({ text: aliasToDelete }, storage);
        if (wasCommandDeleted) {
            logger.info(`[delete] ${aliasToDelete} deleted.`);
            await ack({
                response_type: 'ephemeral',
                text: `Alias ${aliasToDelete} has been successfully deleted`,
            });
        } else {
            logger.info(`[delete] ${aliasToDelete} does not exist.`);
            await ack({
                response_type: 'ephemeral',
                text: `The alias :${aliasToDelete} does not exist. No-op.`,
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
