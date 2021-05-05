import { app } from '../app';
import { callAuthorized } from './user-auth';
import { deleteCommand } from '../messages';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

const tag = 'delete-alias';

app.command('/delete', callAuthorized, async ({ payload, command, ack, logger }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        logger.info(`[delete] deleting command invoked.`);
        const [aliasToDelete] = command.text.trim().split(' ');

        if (!aliasToDelete) {
            orangeLogger.logStep(logger, tag, 'invalidated', payload);
            await ack({
                response_type: 'ephemeral',
                text: `Invalid command pattern.`,
            });
        } else orangeLogger.logStep(logger, tag, 'validated', payload);

        orangeLogger.logStep(logger, tag, 'deleting', payload);

        const operationResult = await deleteCommand({ text: aliasToDelete }, storage, command);
        if (operationResult.success) {
            orangeLogger.logStep(logger, tag, 'deleted', payload);
            await ack({
                response_type: 'ephemeral',
                text: `Alias ${aliasToDelete} has been successfully deleted`,
            });
        } else {
            orangeLogger.logStep(logger, tag, 'no-op', payload);
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
        orangeLogger.logError(err, payload);
    }
});
