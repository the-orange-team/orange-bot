import { SlashCommand } from '@slack/bolt';
import { OperationResult, Storage } from '../storage';
import { getRandomElement, Maybe } from '../utils';
import { Alias } from './types';

export const messageStartingWithColonRegex = /^:[^: ]*[^: ]$/;

export async function getCommandResponse(
    commandKey: string,
    storage: Storage<Alias>
): Promise<Maybe<string>> {
    if (!commandKey.startsWith(':')) commandKey = ':' + commandKey;
    const command = await storage.getValue(commandKey);
    if (!command) return null;

    const selectedResponse = getRandomElement(command.values);
    return selectedResponse;
}

export async function getCommand(
    commandKey: string,
    storage: Storage<Alias>
): Promise<Maybe<Alias>> {
    return await storage.getValue(commandKey);
}

export async function createCommand(command: Alias, storage: Storage<Alias>): Promise<void> {
    const commandKey = command.text.startsWith(':') ? command.text : ':' + command.text;
    await storage.setValue(commandKey.toLowerCase(), command);
}

export async function deleteCommand(
    { text: command }: Pick<Alias, 'text'>,
    storage: Storage<Alias>,
    commandContext: SlashCommand
): Promise<OperationResult> {
    if (!command.startsWith(':')) command = ':' + command;

    const alias = await storage.getValue(command);

    if (!alias || alias.userId !== commandContext.user_id)
        return { error: 'You can only delete the aliases you created', success: false };

    const result = await storage.deleteValue(`${command}`.toLowerCase());

    // this one should be rethrowed since it should be handled on the caller method:
    // it's a redis exception that will be thrown if the key can't be deleted for some reason.
    if (result.error) throw new Error(result.error);

    return { success: result.success };
}
