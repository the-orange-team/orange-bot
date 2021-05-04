import { getRandomElement, Maybe } from '../utils';
import { Storage } from '../storage';
import { Command } from './types';

export const messageStartingWithColonRegex = /^:[^: ]*[^: ]$/;

export async function getCommandResponse(
    commandKey: string,
    storage: Storage<Command>
): Promise<Maybe<string>> {
    if (!commandKey.startsWith(':')) commandKey = ':' + commandKey;
    const command = await storage.getValue(commandKey);
    if (!command) return null;

    const selectedResponse = getRandomElement(command.values);
    return selectedResponse;
}

export async function getCommand(
    commandKey: string,
    storage: Storage<Command>
): Promise<Maybe<Command>> {
    return await storage.getValue(commandKey);
}

export async function createCommand(command: Command, storage: Storage<Command>): Promise<void> {
    const commandKey = command.command.startsWith(':') ? command.command : ':' + command.command;
    await storage.setValue(commandKey.toLowerCase(), command);
}

export async function deleteCommand(
    { command }: Pick<Command, 'command'>,
    storage: Storage<Command>
): Promise<boolean> {
    if (!command.startsWith(':')) command = ':' + command;

    const result = await storage.deleteValue(`${command}`.toLowerCase());
    if (result.error) throw new Error(result.error);
    return result.success;
}
