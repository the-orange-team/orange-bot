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
            await context.sendEphemeral(
                'Argumentos inválidos, utilize o `/help delete` caso queira verificar como utilizar esse comando'
            );
        } else context.logStep(tag, 'validated');

        context.logStep(tag, 'deleting');

        const operationResult = await deleteAlias(
            { text: aliasToDelete },
            command.user_id,
            storage
        );
        if (operationResult.success) {
            context.logStep(tag, 'deleted');
            await context.sendEphemeral(`Alias ${aliasToDelete} foi deletado com sucesso`);
        } else {
            context.logStep(tag, 'no-op');
            await context.sendEphemeral(
                'Operação ignorada. Alias não existe ou não pode ser deletado.'
            );
        }
    } catch (err) {
        logger.error(err);
        await context.sendEphemeral(`Algo deu errado: ${err.message}`);
        context.logError(err);
    }
});
