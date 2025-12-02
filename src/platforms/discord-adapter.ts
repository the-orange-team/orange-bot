/**
 * Discord adapter implementing the PlatformAdapter interface.
 * Bridges Discord.js API to the unified platform abstraction.
 */
import {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    InteractionReplyOptions,
    SlashCommandOptionsOnlyBuilder,
    Message,
    MessageCreateOptions,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    InteractionUpdateOptions,
} from 'discord.js';
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

// Regex to match :alias: pattern (same as Slack)
const ALIAS_PATTERN =
    /(^|[ ]+):([\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ!@#$%^&*()_+\-=[\]{};'"\\|,.<>/?]+)([^\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ!@#$%^&*()_+\-=[\]{};'"\\|,.<>/?:]|$)/;

/**
 * Convert MessageButton style to Discord ButtonStyle.
 */
function toDiscordButtonStyle(style?: MessageButton['style']): ButtonStyle {
    switch (style) {
        case 'primary':
            return ButtonStyle.Primary;
        case 'danger':
            return ButtonStyle.Danger;
        case 'secondary':
        default:
            return ButtonStyle.Secondary;
    }
}

/**
 * Create Discord button components from UnifiedMessage buttons.
 */
function createButtonRow(buttons: MessageButton[]): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();
    
    for (const button of buttons) {
        const discordButton = new ButtonBuilder()
            .setCustomId(button.id)
            .setLabel(button.label)
            .setStyle(toDiscordButtonStyle(button.style))
            .setDisabled(button.disabled ?? false);
        
        row.addComponents(discordButton);
    }
    
    return row;
}

/**
 * Convert a UnifiedMessage to Discord's message format for interactions.
 */
function toDiscordMessage(message: UnifiedMessage): InteractionReplyOptions {
    const options: InteractionReplyOptions = {
        ephemeral: message.ephemeral ?? false,
    };

    // If there's an image, use an embed
    if (message.image) {
        const embed = new EmbedBuilder()
            .setDescription(message.markdown || message.text)
            .setImage(message.image.url);

        options.embeds = [embed];
    } else {
        // Just use content for simple text messages
        options.content = message.markdown || message.text;
    }

    // Add buttons if present
    if (message.buttons && message.buttons.length > 0) {
        options.components = [createButtonRow(message.buttons)];
    }

    return options;
}

/**
 * Convert a UnifiedMessage to Discord's message format for updating.
 */
function toDiscordUpdateMessage(message: UnifiedMessage): InteractionUpdateOptions {
    const options: InteractionUpdateOptions = {};

    // If there's an image, use an embed
    if (message.image) {
        const embed = new EmbedBuilder()
            .setDescription(message.markdown || message.text)
            .setImage(message.image.url);

        options.embeds = [embed];
    } else {
        // Just use content for simple text messages
        options.content = message.markdown || message.text;
    }

    // Add buttons if present
    if (message.buttons && message.buttons.length > 0) {
        options.components = [createButtonRow(message.buttons)];
    } else {
        options.components = [];
    }

    return options;
}

/**
 * Convert a UnifiedMessage to Discord's message format for regular messages.
 */
function toDiscordChannelMessage(message: UnifiedMessage): MessageCreateOptions {
    const options: MessageCreateOptions = {};

    // If there's an image, use an embed
    if (message.image) {
        const embed = new EmbedBuilder()
            .setDescription(message.markdown || message.text)
            .setImage(message.image.url);

        options.embeds = [embed];
    } else {
        // Just use content for simple text messages
        options.content = message.markdown || message.text;
    }

    return options;
}

interface RegisteredCommand {
    name: string;
    handler: CommandHandler;
    builder: SlashCommandOptionsOnlyBuilder;
}

interface RegisteredButtonHandler {
    prefix: string;
    handler: ButtonHandler;
}

export class DiscordAdapter implements PlatformAdapter {
    readonly platform = 'discord' as const;
    private client: Client;
    private rest: REST;
    private commands: Map<string, RegisteredCommand> = new Map();
    private buttonHandlers: RegisteredButtonHandler[] = [];
    private messageHandler: CommandHandler | null = null;
    private clientId: string;
    private guildId?: string; // Optional: for guild-specific commands (faster registration)

    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent, // Required to read message content for :alias: pattern
            ],
        });

        this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        this.clientId = process.env.DISCORD_CLIENT_ID!;
        this.guildId = process.env.DISCORD_GUILD_ID; // Optional

        this.setupEventHandlers();
    }

    /**
     * Get the underlying Discord.js client for advanced usage.
     */
    getClient(): Client {
        return this.client;
    }

    registerCommand(name: string, handler: CommandHandler): void {
        const commandName = name.startsWith('/') ? name.slice(1) : name;

        const builder = new SlashCommandBuilder()
            .setName(commandName)
            .setDescription(`Execute the ${commandName} command`)
            .addStringOption((option) =>
                option.setName('args').setDescription('Command arguments').setRequired(false)
            );

        this.commands.set(commandName, {
            name: commandName,
            handler,
            builder,
        });
    }

    /**
     * Register a handler for :alias: message patterns.
     */
    registerMessagePattern(handler: CommandHandler): void {
        this.messageHandler = handler;
    }

    /**
     * Register a button action handler.
     */
    registerButtonHandler(actionIdPrefix: string, handler: ButtonHandler): void {
        this.buttonHandlers.push({ prefix: actionIdPrefix, handler });
    }

    private setupEventHandlers(): void {
        this.client.on('ready', () => {
            console.log(`🎮 Discord bot logged in as ${this.client.user?.tag}`);
        });

        // Handle slash command interactions
        this.client.on('interactionCreate', async (interaction) => {
            // Handle button interactions
            if (interaction.isButton()) {
                await this.handleButtonInteraction(interaction);
                return;
            }

            if (!interaction.isChatInputCommand()) return;

            const command = this.commands.get(interaction.commandName);
            if (!command) {
                console.warn(`Unknown command: ${interaction.commandName}`);
                return;
            }

            try {
                const ctx = this.createContext(interaction);
                await command.handler(ctx);
            } catch (error) {
                console.error(`Error handling command ${interaction.commandName}:`, error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'An error occurred while processing your command.',
                        ephemeral: true,
                    });
                }
            }
        });

        // Handle :alias: pattern in messages
        this.client.on('messageCreate', async (message) => {
            // Ignore bot messages
            if (message.author.bot) return;

            // Check for :alias: pattern
            const match = ALIAS_PATTERN.exec(message.content);
            if (!match || !this.messageHandler) return;

            const aliasName = match[2];
            console.log(`[Discord] Detected alias: :${aliasName}:`);

            try {
                const ctx = this.createMessageContext(message, aliasName);
                await this.messageHandler(ctx);
            } catch (error) {
                console.error(`Error handling alias :${aliasName}:`, error);
            }
        });
    }

    /**
     * Handle button interaction clicks.
     */
    private async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
        const buttonId = interaction.customId;
        
        // Find the matching handler
        const registered = this.buttonHandlers.find((h) => buttonId.startsWith(h.prefix));
        if (!registered) {
            console.warn(`No handler for button: ${buttonId}`);
            return;
        }

        const user: PlatformUser = {
            id: interaction.user.id,
            username: interaction.user.username,
            displayName: interaction.user.displayName || interaction.user.username,
        };

        const channel: PlatformChannel = {
            id: interaction.channelId,
            name:
                interaction.channel && 'name' in interaction.channel
                    ? interaction.channel.name ?? undefined
                    : undefined,
        };

        let acknowledged = false;

        const ctx: ButtonContext = {
            platform: 'discord',
            user,
            channel,
            buttonId,

            updateMessage: async (message: UnifiedMessage) => {
                const discordMessage = toDiscordUpdateMessage(message);
                if (!acknowledged) {
                    await interaction.update(discordMessage);
                    acknowledged = true;
                } else {
                    await interaction.editReply(discordMessage);
                }
            },

            ack: async () => {
                if (!acknowledged) {
                    await interaction.deferUpdate();
                    acknowledged = true;
                }
            },

            logStep: (tag: string, logMessage: string) => {
                console.log(`[${tag}] ${logMessage}`);
            },

            logError: (error: unknown) => {
                console.error('[Discord Button Error]', error);
            },
        };

        try {
            await registered.handler(ctx);
        } catch (error) {
            console.error(`Error handling button ${buttonId}:`, error);
        }
    }

    private createContext(interaction: ChatInputCommandInteraction): PlatformContext {
        const user: PlatformUser = {
            id: interaction.user.id,
            username: interaction.user.username,
            displayName: interaction.user.displayName || interaction.user.username,
        };

        const channel: PlatformChannel = {
            id: interaction.channelId,
            name:
                interaction.channel && 'name' in interaction.channel
                    ? interaction.channel.name ?? undefined
                    : undefined,
        };

        // Get command arguments
        const args = interaction.options.getString('args') || '';

        let acknowledged = false;

        return {
            platform: 'discord',
            user,
            channel,
            commandText: args,

            sendMessage: async (message: UnifiedMessage) => {
                const discordMessage = toDiscordMessage(message);
                if (!acknowledged) {
                    await interaction.reply(discordMessage);
                    acknowledged = true;
                } else {
                    await interaction.followUp(discordMessage);
                }
            },

            sendEphemeral: async (message: UnifiedMessage) => {
                const discordMessage = toDiscordMessage({ ...message, ephemeral: true });
                if (!acknowledged) {
                    await interaction.reply(discordMessage);
                    acknowledged = true;
                } else {
                    await interaction.followUp(discordMessage);
                }
            },

            ack: async () => {
                if (!acknowledged) {
                    await interaction.deferReply();
                    acknowledged = true;
                }
            },

            logStep: (tag: string, message: string) => {
                console.log(`[${tag}] ${message}`);
            },

            logError: (error: unknown) => {
                console.error('[Discord Error]', error);
            },
        };
    }

    /**
     * Create a context for message-based alias handling.
     */
    private createMessageContext(message: Message, aliasName: string): PlatformContext {
        const user: PlatformUser = {
            id: message.author.id,
            username: message.author.username,
            displayName: message.author.displayName || message.author.username,
        };

        const channel: PlatformChannel = {
            id: message.channelId,
            name: 'name' in message.channel ? message.channel.name ?? undefined : undefined,
        };

        return {
            platform: 'discord',
            user,
            channel,
            commandText: aliasName,

            sendMessage: async (msg: UnifiedMessage) => {
                if (!message.channel.isSendable()) return;
                const discordMessage = toDiscordChannelMessage(msg);
                await message.channel.send(discordMessage);
            },

            sendEphemeral: async (msg: UnifiedMessage) => {
                // Discord doesn't have ephemeral for regular messages, so we reply normally
                if (!message.channel.isSendable()) return;
                const discordMessage = toDiscordChannelMessage(msg);
                await message.channel.send(discordMessage);
            },

            ack: async () => {
                // No-op for message-based context
            },

            logStep: (tag: string, logMessage: string) => {
                console.log(`[${tag}] ${logMessage}`);
            },

            logError: (error: unknown) => {
                console.error('[Discord Error]', error);
            },
        };
    }

    /**
     * Register slash commands with Discord API.
     */
    private async registerSlashCommands(): Promise<void> {
        const commandsData = Array.from(this.commands.values()).map((cmd) => cmd.builder.toJSON());

        try {
            console.log(`🎮 Registering ${commandsData.length} Discord slash commands...`);

            if (this.guildId) {
                // Guild commands update instantly (good for development)
                await this.rest.put(Routes.applicationGuildCommands(this.clientId, this.guildId), {
                    body: commandsData,
                });
                console.log(`🎮 Registered commands for guild ${this.guildId}`);
            } else {
                // Global commands can take up to an hour to propagate
                await this.rest.put(Routes.applicationCommands(this.clientId), {
                    body: commandsData,
                });
                console.log('🎮 Registered global Discord commands');
            }
        } catch (error) {
            console.error('Failed to register Discord commands:', error);
            throw error;
        }
    }

    async start(): Promise<void> {
        // Register commands with Discord API first
        await this.registerSlashCommands();

        // Then login to Discord
        await this.client.login(process.env.DISCORD_TOKEN);
        console.log('🎮 Discord adapter started');
    }

    async stop(): Promise<void> {
        await this.client.destroy();
        console.log('🎮 Discord adapter stopped');
    }
}

// Export singleton instance
let discordAdapter: DiscordAdapter | null = null;

export function getDiscordAdapter(): DiscordAdapter {
    if (!discordAdapter) {
        discordAdapter = new DiscordAdapter();
    }
    return discordAdapter;
}
