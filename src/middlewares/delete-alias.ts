import { app } from '../app';
import { callAuthorized } from './user-auth';
import { deleteCommand } from '../messages';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

const tag = 'delete-alias';

app.command('/delete', callAuthorized, async ({ payload, command, context, logger }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        const [aliasToDelete] = command.text.trim().split(' ');

        if (!aliasToDelete) {
            orangeLogger.logStep(logger, tag, 'invalidated', payload);
            await context.sendEphemeral(`Invalid command pattern.`);
        } else orangeLogger.logStep(logger, tag, 'validated', payload);

        orangeLogger.logStep(logger, tag, 'deleting', payload);

        const operationResult = await deleteCommand({ text: aliasToDelete }, storage, command);
        if (operationResult.success) {
            orangeLogger.logStep(logger, tag, 'deleted', payload);
            await context.sendEphemeral(`Alias ${aliasToDelete} has been successfully deleted`);
        } else {
            orangeLogger.logStep(logger, tag, 'no-op', payload);
            await context.sendEphemeral(`${operationResult.error}. No-op.`);
        }
    } catch (err) {
        logger.error(err);
        await context.sendEphemeral(`Something went wrong`);
        orangeLogger.logError(err, payload);
    }
});
