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
    await storage.setValue(`:${command}`.toLowerCase(), values);
}
