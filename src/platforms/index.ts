/**
 * Platform abstraction layer for multi-platform bot support.
 */

export * from './types';
export { SlackAdapter, getSlackAdapter } from './slack-adapter';
export { DiscordAdapter, getDiscordAdapter } from './discord-adapter';
