import { Block } from '@slack/bolt';
import { app } from '../app';
import { callAuthorized } from './user-auth';
import { Alias } from '../messages/types';
import { storage } from '../storage';
import { addTextSectionToBlocks, groupArrayByKey } from '../utils';
import { orangeLogger } from '../logger';

const tag = 'list-alias';

const getAliasesText = (aliases: Alias[]) => aliases.map((alias) => `:${alias.text}`);

app.command('/list', callAuthorized, async ({ context, command }) => {
    try {
        context.logStep(tag, 'received');
        const aliasesKeys = await storage.getAllAliasesKeys();
        context.logStep(tag, 'retrieved keys');

        const allAliases = await storage.getAliasesByKeys(aliasesKeys);
        context.logStep(tag, 'retrieved aliases');

        const aliasesGroupedByUser = groupArrayByKey<Alias, string>(
            Array.from(allAliases.values()),
            (alias) => alias.userId
        );

        const userAliases = aliasesGroupedByUser[command.user_id] ?? [];
        const otherAliases = Object.entries(aliasesGroupedByUser)
            .filter(([key]) => key !== command.user_id)
            .map(([, aliases]) => aliases)
            .flat();

        const commandResultBlocks: Block[] = [];

        if (userAliases.length) {
            context.logStep(tag, 'user aliases loaded');
            addTextSectionToBlocks(
                `Your aliases:\n${getAliasesText(userAliases).join('\n')}`,
                commandResultBlocks
            );
        }

        if (otherAliases.length) {
            context.logStep(tag, 'others aliases loaded');
            addTextSectionToBlocks(
                `Others' aliases:\n${getAliasesText(otherAliases).join('\n')}`,
                commandResultBlocks
            );
        }

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
