import { app } from '../app';
import { deleteAlias } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';

const tag = 'delete-alias';

app.command('/delete', callAuthorized, async ({ command, context, logger }) => {
    try {
        context.logStep(tag, 'received');
        const [aliasToDelete] = command.text.trim().split(' ');

        if (!aliasToDelete) {
            context.logStep(tag, 'invalidated');
            await context.sendEphemeral(`Invalid command pattern.`);
        } else context.logStep(tag, 'validated');

        context.logStep(tag, 'deleting');

        const operationResult = await deleteAlias({ text: aliasToDelete }, storage, command);
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
        context.logError(err);
    }
});
