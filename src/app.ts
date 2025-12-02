import { App, LogLevel } from '@slack/bolt';
import { getSlackAdapter } from './platforms/slack-adapter';
import { getDiscordAdapter } from './platforms/discord-adapter';
import {
    pokedolarHandler,
    helpHandler,
    freeEpicGamesHandler,
    listHandler,
    createHandler,
    deleteHandler,
    replaceHandler,
    hiddenHandler,
    fixLinkHandler,
    resetHandler,
    getAliasHandler,
} from './commands';

// Legacy singleton for backward compatibility with existing middlewares
const singleton = new App({
    token: process.env.SLACK_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    logLevel: LogLevel.INFO,
});

export const app = singleton;

// New platform adapters
export const slackAdapter = getSlackAdapter();
export const discordAdapter = getDiscordAdapter();

// Register cross-platform commands with Discord
// (Slack commands are still registered via middlewares for now)
discordAdapter.registerCommand('pokedolar', pokedolarHandler);
discordAdapter.registerCommand('help', helpHandler);
discordAdapter.registerCommand('free-epic-games', freeEpicGamesHandler);
discordAdapter.registerCommand('list', listHandler);
discordAdapter.registerCommand('create', createHandler);
discordAdapter.registerCommand('delete', deleteHandler);
discordAdapter.registerCommand('replace', replaceHandler);
discordAdapter.registerCommand('hidden', hiddenHandler);
discordAdapter.registerCommand('fix-link', fixLinkHandler);
discordAdapter.registerCommand('reset', resetHandler);

// Register :alias: pattern handler for Discord messages
discordAdapter.registerMessagePattern(getAliasHandler);

// Helper to check if Discord is configured
export function isDiscordEnabled(): boolean {
    return !!(process.env.DISCORD_TOKEN && process.env.DISCORD_CLIENT_ID);
}
