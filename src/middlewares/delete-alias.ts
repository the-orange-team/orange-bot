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
        logger.info(`[delete] target alias :${aliasToDelete}. trying to delete...`);

        const operationResult = await deleteCommand({ text: aliasToDelete }, storage, command);
        if (operationResult.success) {
            logger.info(`[delete] ${aliasToDelete} deleted.`);
            await ack({
                response_type: 'ephemeral',
                text: `Alias ${aliasToDelete} has been successfully deleted`,
            });
        } else {
            logger.info(
                `[delete] :${aliasToDelete} was not deleted. Error: ${operationResult.error}.`
            );
            await ack({
                response_type: 'ephemeral',
                text: `${operationResult.error}. No-op.`,
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
