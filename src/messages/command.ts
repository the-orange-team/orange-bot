import { getRandomElement } from '../utils';
import { Storage } from '../storage';
import { Command } from './types';

export const messageStartingWithColonRegex = /^:[^: ]*[^: ]$/;

export async function returnCommand(command: string, storage: Storage): Promise<string | null> {
    if (!command.startsWith(':')) command = ':' + command;
    const response = await storage.getValue(command);
    if (!response) return null;

    const selectedResponse = response instanceof Array ? getRandomElement(response) : response;
    return selectedResponse;
}

export async function createCommand({ command, values }: Command, storage: Storage): Promise<void> {
    if (!command.startsWith(':')) command = ':' + command;
    await storage.setValue(`${command}`.toLowerCase(), values);
}

export async function deleteCommand(
    { command }: Pick<Command, 'command'>,
    storage: Storage
): Promise<boolean> {
    if (!command.startsWith(':')) command = ':' + command;

    const result = await storage.deleteValue(`${command}`.toLowerCase());
    if (result.error) throw new Error(result.error);
    return result.success;
}
