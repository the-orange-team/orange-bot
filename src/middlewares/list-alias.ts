import { app } from '../app';
import { aliasListToSlackBlock, listAlias, addTextSectionToBlocks } from '../messages';
import { storage } from '../storage';
import { callAuthorized } from './user-auth';

const tag = 'list-alias';

app.command('/list', callAuthorized, async ({ context, command }) => {
    try {
        context.logStep(tag, 'received');

        const aliasList = await listAlias(command.user_id, storage);

        const commandResultBlocks = aliasListToSlackBlock(aliasList);

        context.logStep(tag, 'retrieved aliases');

        if (!commandResultBlocks.length) {
            context.logStep(tag, 'no alias loaded');
            addTextSectionToBlocks(`No aliases were created yet.`, commandResultBlocks);
        }

        await context.sendComposedEphemeral({
            blocks: commandResultBlocks,
            response_type: 'ephemeral',
        });
    } catch (err) {
        context.logError(err);
        await context.sendComposedEphemeral({
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
