import { getRandomElement, Maybe } from '../utils';
import { Storage } from '../storage';
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
    storage: Storage<Alias>
): Promise<boolean> {
    if (!command.startsWith(':')) command = ':' + command;

    const result = await storage.deleteValue(`${command}`.toLowerCase());
    if (result.error) throw new Error(result.error);
    return result.success;
}
