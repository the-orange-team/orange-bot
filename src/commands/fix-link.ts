/**
 * Cross-platform fix-link command handler.
 */
import { CommandHandler, PlatformContext } from '../platforms/types';
import { extractUrl, getHost, replaceHostname } from '../utils/url-util';

const TAG = 'fix-link';

const HOST_MAP: { [key: string]: string } = {
    'x.com': 'fxtwitter.com',
    'twitter.com': 'fxtwitter.com',
    'reddit.com': 'rxddit.com',
    'instagram.com': 'ddinstagram.com',
};

function convertToFixedEmbedLink(url: string): string {
    const urlHost = getHost(url);
    return HOST_MAP[urlHost] ? replaceHostname(url, HOST_MAP[urlHost]) : url;
}

export const fixLinkHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG, 'received');

        const url = extractUrl(ctx.commandText);

        if (!url) {
            ctx.logStep(TAG, 'no link found');
            await ctx.sendEphemeral({
                text: 'Nenhum link encontrado. Use `/fix-link <url>`',
            });
            return;
        }

        const fixedUrl = convertToFixedEmbedLink(url);

        await ctx.sendMessage({
            text: `URL enviada por ${ctx.user.displayName || ctx.user.username}: ${fixedUrl}`,
            markdown: `URL enviada por **${
                ctx.user.displayName || ctx.user.username
            }**: ${fixedUrl}`,
        });
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: 'Algo deu errado ao processar o link.',
        });
    }
};
