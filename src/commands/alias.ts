/**
 * Cross-platform alias commands: list, create, delete, replace, hidden, get.
 */
import { CommandHandler, PlatformContext, UnifiedMessage } from '../platforms/types';
import { storage } from '../storage';
import {
    listAlias,
    getAliasResponse,
    createAlias as createAliasInStorage,
    deleteAlias as deleteAliasFromStorage,
    Alias,
    AliasList,
} from '../messages/alias';
import { fileSystem, InvalidAliasError } from '../hosting';
import { isMediaUrl } from '../utils';

const TAG_LIST = 'list-alias';
const TAG_CREATE = 'create-alias';
const TAG_DELETE = 'delete-alias';
const TAG_REPLACE = 'replace-alias';
const TAG_HIDDEN = 'hidden-get-alias';
const TAG_GET = 'get-alias';

/**
 * Parse command text for alias creation/replacement: "name -v value1 value2"
 */
function parseAliasCommand(
    commandText: string,
    userId: string
): { alias: Alias; error?: string } | { alias?: undefined; error: string } {
    const regex = /^([^\s]+)\s+-v\s+(.+)$/;
    const match = regex.exec(commandText.trim());

    if (!match) {
        return {
            error: 'Formato inválido. Use: `/comando nome -v valor`',
        };
    }

    const [, name, valuesStr] = match;
    const values = valuesStr.includes(' ') ? valuesStr.split(' ') : [valuesStr];

    return {
        alias: {
            text: name.toLowerCase(),
            userId,
            values,
        },
    };
}

/**
 * Format alias list for display
 */
function formatAliasList(aliasList: AliasList): string {
    const lines: string[] = [];

    if (aliasList.userAliases.length > 0) {
        lines.push('**Seus aliases:**');
        lines.push(aliasList.userAliases.map((a) => `:${a.text}`).join('\n'));
    }

    if (aliasList.otherAliases.length > 0) {
        if (lines.length > 0) lines.push('');
        lines.push('**Aliases de outros:**');
        lines.push(aliasList.otherAliases.map((a) => `:${a.text}`).join('\n'));
    }

    if (lines.length === 0) {
        return 'Ainda não há aliases disponíveis. Use `/help create` para saber como criar um.';
    }

    return lines.join('\n');
}

/**
 * /list - List all available aliases
 */
export const listHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_LIST, 'received');

        const aliasList = await listAlias(ctx.user.id, storage);
        ctx.logStep(TAG_LIST, 'retrieved aliases');

        const text = formatAliasList(aliasList);

        await ctx.sendEphemeral({
            text,
            markdown: text,
        });
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: 'Algo deu errado ao listar aliases.',
        });
    }
};

/**
 * /create - Create a new alias (text command version)
 */
export const createHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_CREATE, 'received');

        const parsed = parseAliasCommand(ctx.commandText, ctx.user.id);

        if (parsed.error || !parsed.alias) {
            ctx.logStep(TAG_CREATE, 'invalidated');
            await ctx.sendEphemeral({
                text:
                    parsed.error ||
                    'Argumentos inválidos. Use `/help create` para mais informações.',
            });
            return;
        }

        ctx.logStep(TAG_CREATE, 'validated');

        // Upload alias (handles media validation)
        const uploadedAlias = await fileSystem.uploadAlias(parsed.alias);
        ctx.logStep(TAG_CREATE, 'uploaded');

        // Store in database
        await createAliasInStorage(uploadedAlias, storage);
        ctx.logStep(TAG_CREATE, 'stored');

        await ctx.sendEphemeral({
            text: `Alias criado! Agora você pode usar \`:${parsed.alias.text}\``,
        });
    } catch (err: any) {
        ctx.logError(err);
        if (err instanceof InvalidAliasError) {
            await ctx.sendEphemeral({
                text: `Erro no alias: ${err.message}`,
            });
        } else {
            await ctx.sendEphemeral({
                text: `Algo deu errado: ${err.message}`,
            });
        }
    }
};

/**
 * /delete - Delete an alias
 */
export const deleteHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_DELETE, 'received');

        const aliasToDelete = ctx.commandText.trim().split(' ')[0];

        if (!aliasToDelete) {
            ctx.logStep(TAG_DELETE, 'invalidated');
            await ctx.sendEphemeral({
                text: 'Argumento inválido. Use `/delete nome-do-alias`',
            });
            return;
        }

        ctx.logStep(TAG_DELETE, 'validated');
        ctx.logStep(TAG_DELETE, 'deleting');

        const result = await deleteAliasFromStorage({ text: aliasToDelete }, ctx.user.id, storage);

        if (result.success) {
            ctx.logStep(TAG_DELETE, 'deleted');
            await ctx.sendEphemeral({
                text: `Alias \`${aliasToDelete}\` foi deletado com sucesso!`,
            });
        } else {
            ctx.logStep(TAG_DELETE, 'no-op');
            await ctx.sendEphemeral({
                text: 'Operação ignorada. O alias não existe ou você não tem permissão para deletá-lo.',
            });
        }
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: `Algo deu errado: ${err.message}`,
        });
    }
};

/**
 * /replace - Replace an existing alias
 */
export const replaceHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_REPLACE, 'received');

        const parsed = parseAliasCommand(ctx.commandText, ctx.user.id);

        if (parsed.error || !parsed.alias) {
            ctx.logStep(TAG_REPLACE, 'invalidated');
            await ctx.sendEphemeral({
                text:
                    parsed.error ||
                    'Argumentos inválidos. Use `/help replace` para mais informações.',
            });
            return;
        }

        ctx.logStep(TAG_REPLACE, 'validated');

        // Check if alias exists
        const existingAlias = await getAliasResponse(parsed.alias.text, storage);

        if (!existingAlias) {
            ctx.logStep(TAG_REPLACE, 'not found');
            await ctx.sendEphemeral({
                text: `Alias \`${parsed.alias.text}\` não existe. Use \`/create\` para criar um novo.`,
            });
            return;
        }

        ctx.logStep(TAG_REPLACE, 'found');

        // Update alias
        await createAliasInStorage(parsed.alias, storage);
        ctx.logStep(TAG_REPLACE, 'updated');

        await ctx.sendEphemeral({
            text: `Alias \`${parsed.alias.text}\` foi substituído com sucesso!`,
        });
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: `Algo deu errado: ${err.message}`,
        });
    }
};

/**
 * /hidden - Show an alias only to the user (ephemeral)
 */
export const hiddenHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_HIDDEN, 'received');

        const aliasName = ctx.commandText.trim();

        if (!aliasName) {
            await ctx.sendEphemeral({
                text: 'Use `/hidden nome-do-alias` para ver um alias apenas para você.',
            });
            return;
        }

        const value = await getAliasResponse(aliasName, storage);
        ctx.logStep(TAG_HIDDEN, 'retrieved');

        if (!value) {
            await ctx.sendEphemeral({
                text: 'Parece que esse alias não existe. Use `/help create` para saber como criar um.',
            });
            return;
        }

        const message: UnifiedMessage = {
            text: value,
            markdown: value,
        };

        // Check if it's a media URL
        if (await isMediaUrl(value)) {
            message.image = {
                url: value,
                alt: aliasName,
            };
        }

        await ctx.sendEphemeral(message);
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: 'A chamada do alias falhou. Entre em contato com os desenvolvedores.',
        });
    }
};

/**
 * Get alias response - used for :alias: pattern matching
 */
export const getAliasHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_GET, 'received');

        const aliasName = ctx.commandText.trim();

        if (!aliasName) {
            return;
        }

        const value = await getAliasResponse(aliasName, storage);
        ctx.logStep(TAG_GET, 'retrieved');

        if (!value) {
            ctx.logStep(TAG_GET, 'not found');
            return;
        }

        const message: UnifiedMessage = {
            text: value,
            markdown: value,
        };

        // Check if it's a media URL
        if (await isMediaUrl(value)) {
            message.image = {
                url: value,
                alt: aliasName,
            };
        }

        await ctx.sendMessage(message);
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendMessage({
            text: 'A chamada do alias falhou.',
        });
    }
};
