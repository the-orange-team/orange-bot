/**
 * Cross-platform alias commands: list, create, delete, replace, hidden, get, search.
 */
import Fuse from 'fuse.js';
import {
    CommandHandler,
    PlatformContext,
    UnifiedMessage,
    ButtonHandler,
    ButtonContext,
    MessageButton,
} from '../platforms/types';
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
const TAG_SEARCH = 'search-alias';

const PAGE_SIZE = 15;
const SEARCH_RESULTS_LIMIT = 10;
const LIST_ACTION_PREFIX = 'alias_list_';

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
 * Get all aliases as a flat array with category labels.
 */
function getAllAliases(aliasList: AliasList): { text: string; isOwn: boolean }[] {
    const all: { text: string; isOwn: boolean }[] = [];

    for (const alias of aliasList.userAliases) {
        all.push({ text: alias.text, isOwn: true });
    }

    for (const alias of aliasList.otherAliases) {
        all.push({ text: alias.text, isOwn: false });
    }

    return all;
}

/**
 * Format a page of aliases for display.
 */
function formatAliasPage(
    aliasList: AliasList,
    page: number,
    pageSize: number
): { text: string; totalPages: number; totalAliases: number } {
    const allAliases = getAllAliases(aliasList);
    const totalAliases = allAliases.length;
    const totalPages = Math.max(1, Math.ceil(totalAliases / pageSize));

    if (totalAliases === 0) {
        return {
            text: 'Ainda não há aliases disponíveis. Use `/help create` para saber como criar um.',
            totalPages: 1,
            totalAliases: 0,
        };
    }

    const start = page * pageSize;
    const end = Math.min(start + pageSize, totalAliases);
    const pageAliases = allAliases.slice(start, end);

    const lines: string[] = [];

    // Group by ownership for this page
    const ownAliases = pageAliases.filter((a) => a.isOwn);
    const otherAliases = pageAliases.filter((a) => !a.isOwn);

    if (ownAliases.length > 0) {
        lines.push('**Seus aliases:**');
        lines.push(ownAliases.map((a) => `:${a.text}`).join(', '));
    }

    if (otherAliases.length > 0) {
        if (lines.length > 0) lines.push('');
        lines.push('**Aliases de outros:**');
        lines.push(otherAliases.map((a) => `:${a.text}`).join(', '));
    }

    lines.push('');
    lines.push(`📄 Página ${page + 1}/${totalPages} (${totalAliases} aliases no total)`);

    return {
        text: lines.join('\n'),
        totalPages,
        totalAliases,
    };
}

/**
 * Create pagination buttons.
 */
function createPaginationButtons(
    userId: string,
    currentPage: number,
    totalPages: number
): MessageButton[] {
    const buttons: MessageButton[] = [];

    buttons.push({
        id: `${LIST_ACTION_PREFIX}${userId}_${currentPage - 1}`,
        label: '◀️ Anterior',
        style: 'secondary',
        disabled: currentPage === 0,
    });

    buttons.push({
        id: `${LIST_ACTION_PREFIX}${userId}_${currentPage + 1}`,
        label: 'Próximo ▶️',
        style: 'secondary',
        disabled: currentPage >= totalPages - 1,
    });

    return buttons;
}

// Cache alias lists briefly for pagination (in-memory, keyed by user ID)
const aliasListCache = new Map<string, { aliasList: AliasList; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedAliasList(userId: string): Promise<AliasList> {
    const cached = aliasListCache.get(userId);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.aliasList;
    }

    const aliasList = await listAlias(userId, storage);
    aliasListCache.set(userId, { aliasList, timestamp: now });

    return aliasList;
}

/**
 * /list - List all available aliases with pagination
 */
export const listHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_LIST, 'received');

        const aliasList = await getCachedAliasList(ctx.user.id);
        ctx.logStep(TAG_LIST, 'retrieved aliases');

        const { text, totalPages, totalAliases } = formatAliasPage(aliasList, 0, PAGE_SIZE);

        const message: UnifiedMessage = {
            text,
            markdown: text,
        };

        // Only add pagination buttons if there's more than one page
        if (totalPages > 1) {
            message.buttons = createPaginationButtons(ctx.user.id, 0, totalPages);
        }

        await ctx.sendEphemeral(message);
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: 'Algo deu errado ao listar aliases.',
        });
    }
};

/**
 * Button handler for pagination.
 */
export const listPaginationHandler: ButtonHandler = async (ctx: ButtonContext) => {
    try {
        ctx.logStep(TAG_LIST, `pagination button clicked: ${ctx.buttonId}`);

        // Parse button ID: alias_list_{userId}_{page}
        const parts = ctx.buttonId.split('_');
        const page = parseInt(parts[parts.length - 1], 10);
        const userId = parts.slice(2, -1).join('_'); // Handle userIds with underscores

        // Security: only allow the original user to paginate
        if (userId !== ctx.user.id) {
            ctx.logStep(TAG_LIST, 'unauthorized pagination attempt');
            return;
        }

        const aliasList = await getCachedAliasList(userId);
        const { text, totalPages } = formatAliasPage(aliasList, page, PAGE_SIZE);

        const message: UnifiedMessage = {
            text,
            markdown: text,
        };

        if (totalPages > 1) {
            message.buttons = createPaginationButtons(userId, page, totalPages);
        }

        await ctx.updateMessage(message);
    } catch (err: any) {
        ctx.logError(err);
    }
};

/**
 * Get the action ID prefix for registering the button handler.
 */
export const LIST_ACTION_ID_PREFIX = LIST_ACTION_PREFIX;

/**
 * /search - Search for aliases using fuzzy matching
 */
export const searchHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG_SEARCH, 'received');

        const query = ctx.commandText.trim();

        if (!query) {
            await ctx.sendEphemeral({
                text: 'Use `/search-alias termo` para buscar aliases. Exemplo: `/search-alias coffee`',
            });
            return;
        }

        ctx.logStep(TAG_SEARCH, `searching for: ${query}`);

        // Get all aliases
        const aliasList = await getCachedAliasList(ctx.user.id);
        const allAliases = getAllAliases(aliasList);

        if (allAliases.length === 0) {
            await ctx.sendEphemeral({
                text: 'Ainda não há aliases disponíveis. Use `/help create` para saber como criar um.',
            });
            return;
        }

        // Configure Fuse.js for fuzzy search
        const fuse = new Fuse(allAliases, {
            keys: ['text'],
            threshold: 0.4, // 0 = exact match, 1 = match anything
            includeScore: true,
            minMatchCharLength: 2,
        });

        const results = fuse.search(query, { limit: SEARCH_RESULTS_LIMIT });
        ctx.logStep(TAG_SEARCH, `found ${results.length} results`);

        if (results.length === 0) {
            await ctx.sendEphemeral({
                text: `Nenhum alias encontrado para "${query}". Tente outro termo ou use \`/list\` para ver todos.`,
            });
            return;
        }

        // Format results
        const lines: string[] = [`🔍 Resultados para "${query}":\n`];

        for (const result of results) {
            const alias = result.item;
            const ownership = alias.isOwn ? '(seu)' : '';
            lines.push(`:${alias.text}: ${ownership}`);
        }

        if (results.length === SEARCH_RESULTS_LIMIT) {
            lines.push(`\n_Mostrando os ${SEARCH_RESULTS_LIMIT} primeiros resultados._`);
        }

        const text = lines.join('\n');

        await ctx.sendEphemeral({
            text,
            markdown: text,
        });
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: 'Algo deu errado ao buscar aliases.',
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
