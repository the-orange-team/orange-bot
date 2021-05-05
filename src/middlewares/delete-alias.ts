import { app } from '../app';
import { callAuthorized } from './user-auth';
import { deleteCommand } from '../messages';
import { storage } from '../storage';
import { orangeLogger } from '../logger';

const tag = 'delete-alias';

app.command('/delete', callAuthorized, async ({ payload, command, context, logger }) => {
    try {
        context.logStep(tag, 'received');
        const [aliasToDelete] = command.text.trim().split(' ');

        if (!aliasToDelete) {
            context.logStep(tag, 'invalidated');
            await context.sendEphemeral(`Invalid command pattern.`);
        } else context.logStep(tag, 'validated');

        context.logStep(tag, 'deleting');

        const operationResult = await deleteCommand({ text: aliasToDelete }, storage, command);
        if (operationResult.success) {
            context.logStep(tag, 'deleted');
            await context.sendEphemeral(`Alias ${aliasToDelete} has been successfully deleted`);
        } else {
            context.logStep(tag, 'no-op');
            await context.sendEphemeral(`${operationResult.error}. No-op.`);
        }
    } catch (err) {
        logger.error(err);
        await context.sendEphemeral(`Something went wrong`);
        context.logError(err, payload);
    }
});
