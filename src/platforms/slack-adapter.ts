/**
 * Slack adapter implementing the PlatformAdapter interface.
 * Bridges Slack Bolt API to the unified platform abstraction.
 */
import {
    App,
    LogLevel,
    SlackCommandMiddlewareArgs,
    AllMiddlewareArgs,
    BlockAction,
    ButtonAction,
} from '@slack/bolt';
import {
    PlatformAdapter,
    PlatformContext,
    CommandHandler,
    UnifiedMessage,
    PlatformUser,
    PlatformChannel,
    ButtonHandler,
    ButtonContext,
    MessageButton,
} from './types';

/**
 * Convert MessageButton style to Slack button style.
 */
function toSlackButtonStyle(style?: MessageButton['style']): 'primary' | 'danger' | undefined {
    switch (style) {
        case 'primary':
            return 'primary';
        case 'danger':
            return 'danger';
        default:
            return undefined;
    }
}

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

    // Add buttons if present
    if (message.buttons && message.buttons.length > 0) {
        blocks.push({
            type: 'actions',
            elements: message.buttons.map((button) => ({
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: button.label,
                    emoji: true,
                },
                action_id: button.id,
                style: toSlackButtonStyle(button.style),
            })),
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
    private buttonHandlers: Map<string, ButtonHandler> = new Map();

    constructor(existingApp?: App) {
        this.app =
            existingApp ??
            new App({
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

    /**
     * Register a button action handler.
     */
    registerButtonHandler(actionIdPrefix: string, handler: ButtonHandler): void {
        this.buttonHandlers.set(actionIdPrefix, handler);

        // Register with Slack using regex to match prefix
        this.app.action(
            new RegExp(`^${actionIdPrefix}`),
            async ({ action, ack, body, client, respond }) => {
                const buttonAction = action as ButtonAction;
                const blockAction = body as BlockAction;

                const user: PlatformUser = {
                    id: blockAction.user.id,
                    username: blockAction.user.username || blockAction.user.id,
                    displayName: blockAction.user.name,
                };

                const channel: PlatformChannel = {
                    id: blockAction.channel?.id || '',
                    name: blockAction.channel?.name,
                };

                let acknowledged = false;

                const ctx: ButtonContext = {
                    platform: 'slack',
                    user,
                    channel,
                    buttonId: buttonAction.action_id,

                    updateMessage: async (message: UnifiedMessage) => {
                        const slackMessage = toSlackMessage(message);
                        await respond({
                            ...slackMessage,
                            replace_original: true,
                        });
                    },

                    ack: async () => {
                        if (!acknowledged) {
                            await ack();
                            acknowledged = true;
                        }
                    },

                    logStep: (tag: string, logMessage: string) => {
                        console.log(`[${tag}] ${logMessage}`);
                    },

                    logError: (error: unknown) => {
                        console.error('[Slack Button Error]', error);
                    },
                };

                try {
                    await ctx.ack(); // Always ack first for Slack
                    await handler(ctx);
                } catch (error) {
                    console.error(`Error handling button ${buttonAction.action_id}:`, error);
                }
            }
        );
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

export function getSlackAdapter(existingApp?: App): SlackAdapter {
    if (!slackAdapter) {
        slackAdapter = new SlackAdapter(existingApp);
    }
    return slackAdapter;
}
