import { Block } from '@slack/bolt';
import { app } from '../app';
import { callAuthorized } from './user-auth';
import { Alias } from '../messages/types';
import { storage } from '../storage';
import { addTextSectionToBlocks, groupArrayByKey, Maybe } from '../utils';

const getAliasesText = (aliases: Alias[]) => aliases.map((alias) => `:${alias.text}`);

app.command('/list', callAuthorized, async ({ ack, logger, command }) => {
    try {
        const aliasesKeys = await storage.getAllAliasesKeys();
        logger.info("[list] retrieved aliases' keys.");

        const allAliases = await storage.getAliasesByKeys(aliasesKeys);
        logger.info('[list] retrieved aliases using keys.');

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
            addTextSectionToBlocks(
                `Your aliases:\n${getAliasesText(userAliases).join('\n')}`,
                commandResultBlocks
            );
        }

        if (otherAliases.length) {
            addTextSectionToBlocks(
                `Others' aliases:\n${getAliasesText(otherAliases).join('\n')}`,
                commandResultBlocks
            );
        }

        if (!commandResultBlocks.length) {
            addTextSectionToBlocks(`No aliases were created yet.`, commandResultBlocks);
        }

        await ack({
            blocks: commandResultBlocks,
            response_type: 'ephemeral',
        });
    } catch (err) {
        logger.error(err);
        await ack({
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
