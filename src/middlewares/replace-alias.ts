import { app } from '../app';
import { createAlias, getAliasResponse, slackCommandToCommand } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';

const tag = 'replace-alias';

app.command('/replace', callAuthorized, async ({ command, context }) => {
    try {
        context.logStep(tag, 'received');
        const botCommand = slackCommandToCommand(command);
        if (botCommand) {
            context.logStep(tag, 'validated');
            const isCommandRegistered = await getAliasResponse(botCommand.text, storage);
            if (isCommandRegistered) {
                context.logStep(tag, 'found');
                await createAlias(botCommand, storage);
                context.logStep(tag, 'updated');
                await context.sendEphemeral(`Alias ${botCommand.text} foi substituído com sucesso`);
            } else {
                context.logStep(tag, 'not found');
                await context.sendEphemeral(
                    `Alias ${botCommand.text} não existe. Utilize \`/help create\` para verificar como criar um alias.`
                );
            }
        } else {
            context.logStep(tag, 'invalidated');
            await context.sendEphemeral(
                'Argumentos inválidos, utilize o `/help replace` caso queira verificar como utilizar esse comando'
            );
        }
    } catch (err: any) {
        await context.sendEphemeral(`Algo deu errado: ${err.message}`);
        context.logError(err);
    }
});
