import { app } from '../app';
import { reactionMap } from '../utils/reactions-map';

app.event('reaction_added', async ({ event, client, logger }) => {
    
    if (event.item.type != 'message') return;
    const value = getTextByReaction(event.reaction);
    if (!value) return;
    logger.info(`[on-reaction-added] triggered by :${event.reaction}:`);
    client.chat.postMessage({
        channel: event.item.channel,
        text: value,
        thread_ts: event.item.ts
    });
});

function getTextByReaction(reaction: string): string | undefined{
    return reactionMap[reaction.toLocaleLowerCase()];
}