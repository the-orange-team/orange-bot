import { OperationResult, Storage } from '../storage';
import { getRandomElement, groupArrayByKey, Maybe } from '../utils';
import { Alias, AliasList } from './types';

export const wordStartingWithColonRegex =
    /\B:([\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ!@#$%^&*()_+\-=[\]{};'"\\|,.<>/?]+)([^\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ!@#$%^&*()_+\-=[\]{};'"\\|,.<>/?:]|$)/;

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
    userId: string,
    storage: Storage<Alias>
): Promise<OperationResult> {
    if (!aliasKey.startsWith(':')) aliasKey = ':' + aliasKey;

    const alias = await storage.getValue(aliasKey);

    if (!alias || alias.userId !== userId)
        return { error: 'You can only delete the aliases you created', success: false };

    const result = await storage.deleteValue(`${aliasKey}`.toLowerCase());

    // this one should be rethrowed since it should be handled on the caller method:
    // it's a redis exception that will be thrown if the key can't be deleted for some reason.
    if (result.error) throw new Error(result.error);

    return { success: result.success };
}

export async function listAlias(userId: string, storage: Storage<Alias>): Promise<AliasList> {
    const aliasesKeys = await storage.getAllAliasesKeys();
    const allAliases = await storage.getAliasesByKeys(aliasesKeys);

    const aliasesGroupedByUser = groupArrayByKey<Alias, string>(
        Array.from(allAliases.values()),
        (alias) => alias.userId
    );

    const sortAliasFn = (alias1: Alias, alias2: Alias) : number => {
        if (alias1.text > alias2.text) {
            return 1;
        } else if (alias2.text > alias1.text) {
            return -1;
        } else {
            return 0;
        }
    };

    const userAliases = aliasesGroupedByUser[userId] ? aliasesGroupedByUser[userId].sort(sortAliasFn) : [];
    const otherAliases = Object.entries(aliasesGroupedByUser)
        .filter(([key]) => key !== userId)
        .flatMap(([, aliases]) => aliases)
        .sort(sortAliasFn);

    return {
        userAliases,
        otherAliases,
    };
}

export { Alias, AliasList };
