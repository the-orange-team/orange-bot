/**
 * Cross-platform reset command handler.
 * Warning: This command flushes the entire database!
 */
import { CommandHandler, PlatformContext } from '../platforms/types';
import { storage } from '../storage';
import Base64 from 'crypto-js/enc-base64';
import sha256 from 'crypto-js/sha256';

const TAG = 'reset-alias';

export const resetHandler: CommandHandler = async (ctx: PlatformContext) => {
    try {
        ctx.logStep(TAG, 'received');

        const storedHash = process.env.RESET_HASH;
        const password = ctx.commandText.trim();
        const digestedArg = Base64.stringify(sha256(password));

        if (storedHash === digestedArg) {
            ctx.logStep(TAG, 'authorized');
            await storage.deleteAllKeys();
            ctx.logStep(TAG, 'database flushed');
            await ctx.sendEphemeral({
                text: "Bot storage flushed. Its final words: I'll be back 🔥🔥👍🔥🔥",
            });
        } else {
            ctx.logStep(TAG, 'denied');
            await ctx.sendEphemeral({
                text: 'Se você não sabe a senha, significa que você não deveria usar esse comando.',
            });
        }
    } catch (err: any) {
        ctx.logError(err);
        await ctx.sendEphemeral({
            text: 'Algo deu errado. Entre em contato com os desenvolvedores e não tente novamente.',
        });
    }
};
