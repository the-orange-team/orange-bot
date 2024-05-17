import { app } from '../app';
import { callAuthorized } from './user-auth';
import { extractUrl, getHost, replaceHostname } from '../utils/url-util';

const tag = 'fix-link';

function convertToFixedEmbedLink(url: string): string {
    const urlHost = getHost(url);
    const hostMap: { [key: string]: string } = {
        'x.com': 'fxtwitter.com',
        'twitter.com': 'fxtwitter.com',
        'reddit.com': 'rxddit.com',
        'instagram.com': 'ddinstagram.com'
    };

    return hostMap[urlHost] ? replaceHostname(url, hostMap[urlHost]) : url;
}

app.command('/fix-link', callAuthorized, async ({ context, say, ack,command }) => {
    try {
        context.logStep(tag, 'received');

        const url = extractUrl(command.text);
        const commandResultBlocks = [];

        if (!url) {
            context.logStep(tag, 'no alias loaded');
            await context.sendEphemeral(`Nenhum link encontrado`);
        } else {
            const fixedUrl = convertToFixedEmbedLink(url);
            await say(`Url enviada por, <@${command.user_id}> : ${fixedUrl}`);
            await ack();
        }
    } catch (err: any) {
        context.logError(err);
        await context.sendComposedEphemeral({
            response_type: 'ephemeral',
            text: `Algo deu errado`,
        });
    }
});
