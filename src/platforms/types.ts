/**
 * Platform-agnostic types and interfaces for multi-platform bot support.
 * These abstractions allow command handlers to work with both Slack and Discord.
 */

/**
 * Button action for interactive messages.
 */
export interface MessageButton {
    /** Unique identifier for the button action */
    id: string;
    /** Button label shown to the user */
    label: string;
    /** Button style */
    style?: 'primary' | 'secondary' | 'danger';
    /** Whether the button is disabled */
    disabled?: boolean;
}

/**
 * Unified message format that can be converted to platform-specific formats.
 */
export interface UnifiedMessage {
    /** Plain text content (used as fallback) */
    text: string;
    /** Rich text with markdown formatting */
    markdown?: string;
    /** Image attachment */
    image?: {
        url: string;
        alt?: string;
    };
    /** Whether the message should only be visible to the user who triggered it */
    ephemeral?: boolean;
    /** Interactive buttons */
    buttons?: MessageButton[];
}

/**
 * User information abstracted across platforms.
 */
export interface PlatformUser {
    id: string;
    username: string;
    displayName?: string;
}

/**
 * Channel/conversation information.
 */
export interface PlatformChannel {
    id: string;
    name?: string;
}

/**
 * Command context passed to all command handlers.
 * This abstracts away platform-specific details.
 */
export interface PlatformContext {
    /** The platform this command originated from */
    platform: 'slack' | 'discord';

    /** The user who triggered the command */
    user: PlatformUser;

    /** The channel where the command was triggered */
    channel: PlatformChannel;

    /** The raw command text (arguments after the command name) */
    commandText: string;

    /** Send a message to the channel */
    sendMessage: (message: UnifiedMessage) => Promise<void>;

    /** Send an ephemeral message (only visible to the triggering user) */
    sendEphemeral: (message: UnifiedMessage) => Promise<void>;

    /** Acknowledge the command (required for some platforms) */
    ack: () => Promise<void>;

    /** Log a step for debugging/monitoring */
    logStep: (tag: string, message: string) => void;

    /** Log an error */
    logError: (error: unknown) => void;
}

/**
 * A command handler function that works across platforms.
 */
export type CommandHandler = (ctx: PlatformContext) => Promise<void>;

/**
 * Context for button interaction handlers.
 */
export interface ButtonContext {
    /** The platform this interaction originated from */
    platform: 'slack' | 'discord';

    /** The user who clicked the button */
    user: PlatformUser;

    /** The channel where the interaction happened */
    channel: PlatformChannel;

    /** The button ID that was clicked */
    buttonId: string;

    /** Update the original message */
    updateMessage: (message: UnifiedMessage) => Promise<void>;

    /** Acknowledge the interaction */
    ack: () => Promise<void>;

    /** Log a step for debugging/monitoring */
    logStep: (tag: string, message: string) => void;

    /** Log an error */
    logError: (error: unknown) => void;
}

/**
 * A button action handler function.
 */
export type ButtonHandler = (ctx: ButtonContext) => Promise<void>;

/**
 * Platform adapter interface for registering commands and handling events.
 */
export interface PlatformAdapter {
    /** The platform name */
    readonly platform: 'slack' | 'discord';

    /** Register a slash command handler */
    registerCommand: (name: string, handler: CommandHandler) => void;

    /** Register a button action handler */
    registerButtonHandler?: (actionIdPrefix: string, handler: ButtonHandler) => void;

    /** Start the platform client */
    start: () => Promise<void>;

    /** Stop the platform client */
    stop: () => Promise<void>;
}
