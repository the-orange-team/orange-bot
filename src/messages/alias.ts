import { SlashCommand } from '@slack/bolt';
import { OperationResult, Storage } from '../storage';
import { getRandomElement, Maybe } from '../utils';
import { Alias } from './types';

export const messageStartingWithColonRegex = /^:[^: ]*[^: ]$/;

export async function getAliasResponse(
    aliasKey: string,
    storage: Storage<Alias>
): Promise<Maybe<string>> {
    if (!aliasKey.startsWith(':')) aliasKey = ':' + aliasKey;
    const alias = await storage.getValue(aliasKey);
    if (!alias) return null;

    const selectedResponse = getRandomElement(alias.values);
    return selectedResponse;
}

export async function getAlias(aliasKey: string, storage: Storage<Alias>): Promise<Maybe<Alias>> {
    return await storage.getValue(aliasKey);
}

export async function createAlias(alias: Alias, storage: Storage<Alias>): Promise<void> {
    const aliasKey = alias.text.startsWith(':') ? alias.text : ':' + alias.text;
    await storage.setValue(aliasKey.toLowerCase(), alias);
}

export async function deleteAlias(
    { text: aliasKey }: Pick<Alias, 'text'>,
    storage: Storage<Alias>,
    commandContext: SlashCommand
): Promise<OperationResult> {
    if (!aliasKey.startsWith(':')) aliasKey = ':' + aliasKey;

    const alias = await storage.getValue(aliasKey);

    if (!alias || alias.userId !== commandContext.user_id)
        return { error: 'You can only delete the aliases you created', success: false };

    const result = await storage.deleteValue(`${aliasKey}`.toLowerCase());

    // this one should be rethrowed since it should be handled on the caller method:
    // it's a redis exception that will be thrown if the key can't be deleted for some reason.
    if (result.error) throw new Error(result.error);

    return { success: result.success };
}
