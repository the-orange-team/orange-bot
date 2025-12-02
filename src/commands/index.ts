/**
 * Cross-platform command handlers.
 *
 * This module exports platform-agnostic command handlers that work
 * with both Slack and Discord using the PlatformContext abstraction.
 */

export { pokedolarHandler } from './pokedolar';
export { helpHandler } from './help';
export { freeEpicGamesHandler } from './free-epic-games';
export {
    listHandler,
    listPaginationHandler,
    LIST_ACTION_ID_PREFIX,
    createHandler,
    deleteHandler,
    replaceHandler,
    hiddenHandler,
    getAliasHandler,
    searchHandler,
} from './alias';
export { fixLinkHandler } from './fix-link';
export { resetHandler } from './reset';
