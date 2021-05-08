import { Context } from '@slack/bolt';
declare module '@slack/bolt' {
    interface Context {
        logError: (error: string) => void;
        logStep: (category: string, message: string) => void;
        sendEphemeral: (text: string) => Promise<void> | undefined;
        sendComposedEphemeral: (composedMessage: RespondArguments) => Promise<void> | undefined;
    }
}
