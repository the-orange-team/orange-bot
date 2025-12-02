export type Alias = {
    text: string;
    userId: string;
    values: string[];
};

export type AliasList = {
    userAliases: Alias[];
    otherAliases: Alias[];
};

/**
 * Unified message format for cross-platform messaging.
 * Re-exported from platforms/types.ts for convenience.
 */
export { UnifiedMessage } from '../platforms/types';
