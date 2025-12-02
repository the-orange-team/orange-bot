/**
 * Slack adapter implementing the PlatformAdapter interface.
 * Bridges Slack Bolt API to the unified platform abstraction.
 */
import { App, LogLevel, SlackCommandMiddlewareArgs, AllMiddlewareArgs } from '@slack/bolt';
import {
    PlatformAdapter,
    PlatformContext,
    CommandHandler,
    UnifiedMessage,
    PlatformUser,
    PlatformChannel,
} from './types';

/**
 * Convert a UnifiedMessage to Slack's message format.
 */
function toSlackMessage(message: UnifiedMessage): any {
    const blocks: any[] = [];

    // Add text/markdown section
    if (message.markdown || message.text) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: message.markdown || message.text,
            },
        });
    }

    // Add image if present
    if (message.image) {
        blocks.push({
            type: 'image',
            block_id: 'platform_image',
            image_url: message.image.url,
            alt_text: message.image.alt || 'Image',
        });
    }

    return {
        text: message.text,
        blocks: blocks.length > 0 ? blocks : undefined,
    };
}

export class SlackAdapter implements PlatformAdapter {
    readonly platform = 'slack' as const;
    private app: App;
    private handlers: Map<string, CommandHandler> = new Map();

    constructor() {
        this.app = new App({
            token: process.env.SLACK_TOKEN,
            appToken: process.env.SLACK_APP_TOKEN,
            socketMode: true,
            logLevel: LogLevel.INFO,
        });
    }

    /**
     * Get the underlying Slack Bolt app for advanced usage.
     */
    getApp(): App {
        return this.app;
    }

    registerCommand(name: string, handler: CommandHandler): void {
        const commandName = name.startsWith('/') ? name : `/${name}`;
        this.handlers.set(commandName, handler);

        this.app.command(commandName, async (args) => {
            const ctx = this.createContext(args);
            await handler(ctx);
        });
    }

    private createContext(args: SlackCommandMiddlewareArgs & AllMiddlewareArgs): PlatformContext {
        const { command, ack, say, client } = args;

        const user: PlatformUser = {
            id: command.user_id,
            username: command.user_name,
            displayName: command.user_name,
        };

        const channel: PlatformChannel = {
            id: command.channel_id,
            name: command.channel_name,
        };

        return {
            platform: 'slack',
            user,
            channel,
            commandText: command.text,

            sendMessage: async (message: UnifiedMessage) => {
                const slackMessage = toSlackMessage(message);
                await say(slackMessage);
            },

            sendEphemeral: async (message: UnifiedMessage) => {
                await client.chat.postEphemeral({
                    channel: channel.id,
                    user: user.id,
                    ...toSlackMessage(message),
                });
            },

            ack: async () => {
                await ack();
            },

            logStep: (tag: string, message: string) => {
                console.log(`[${tag}] ${message}`);
            },

            logError: (error: unknown) => {
                console.error('[Slack Error]', error);
            },
        };
    }

    async start(): Promise<void> {
        const PORT = Number(process.env.PORT) || 3000;
        await this.app.start(PORT);
        console.log(`🟠 Slack adapter started on port ${PORT}`);
    }

    async stop(): Promise<void> {
        await this.app.stop();
        console.log('🟠 Slack adapter stopped');
    }
}

// Export singleton instance for backward compatibility
let slackAdapter: SlackAdapter | null = null;

export function getSlackAdapter(): SlackAdapter {
    if (!slackAdapter) {
        slackAdapter = new SlackAdapter();
    }
    return slackAdapter;
}
