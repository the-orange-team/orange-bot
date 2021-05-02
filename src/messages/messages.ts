import { getRandomElement } from '../utils';
import { Storage } from '../storage';

export const messageStartingWithColonRegex = /^:.*[^:]$/;

export async function returnCommand(command: string, storage: Storage): Promise<string> {
    const response = await storage.getValue(command);
    if (response) {
        const selectedResponse = response instanceof Array ? getRandomElement(response) : response;
        return selectedResponse;
    } else {
        return "command doesn't exist";
    }
}

export async function createCommand(
    command: string,
    values: string,
    storage: Storage
): Promise<void> {
    const value = values.includes(' ') ? values.split(' ') : values;
    await storage.setValue(`:${command}`.toLowerCase(), value);
}
