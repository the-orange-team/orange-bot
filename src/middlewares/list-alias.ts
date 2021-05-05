import { Block } from '@slack/bolt';
import { app } from '../app';
import { callAuthorized } from './user-auth';
import { Alias } from '../messages/types';
import { storage } from '../storage';
import { addTextSectionToBlocks, groupArrayByKey } from '../utils';
import { orangeLogger } from '../logger';

const tag = 'list-alias';

const getAliasesText = (aliases: Alias[]) => aliases.map((alias) => `:${alias.text}`);

app.command('/list', callAuthorized, async ({ context, logger, command, payload }) => {
    try {
        orangeLogger.logStep(logger, tag, 'received', payload);
        const aliasesKeys = await storage.getAllAliasesKeys();
        orangeLogger.logStep(logger, tag, 'retrieved keys', payload);

        const allAliases = await storage.getAliasesByKeys(aliasesKeys);
        orangeLogger.logStep(logger, tag, 'retrieved aliases', payload);

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
            orangeLogger.logStep(logger, tag, 'user aliases loaded', payload);
            addTextSectionToBlocks(
                `Your aliases:\n${getAliasesText(userAliases).join('\n')}`,
                commandResultBlocks
            );
        }

        if (otherAliases.length) {
            orangeLogger.logStep(logger, tag, 'others aliases loaded', payload);
            addTextSectionToBlocks(
                `Others' aliases:\n${getAliasesText(otherAliases).join('\n')}`,
                commandResultBlocks
            );
        }

        if (!commandResultBlocks.length) {
            orangeLogger.logStep(logger, tag, 'no alias loaded', payload);
            addTextSectionToBlocks(`No aliases were created yet.`, commandResultBlocks);
        }

        await context.sendComposedEphemeral({
            blocks: commandResultBlocks,
            response_type: 'ephemeral',
        });
    } catch (err) {
        orangeLogger.logError(err, payload);
        await context.sendComposedEphemeral({
            response_type: 'ephemeral',
            text: `Something went wrong`,
        });
    }
});
